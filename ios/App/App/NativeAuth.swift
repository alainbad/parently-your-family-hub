import AuthenticationServices
import Capacitor
import CryptoKit

@objc(NativeAuthPlugin)
public class NativeAuthPlugin: CAPPlugin, CAPBridgedPlugin, ASWebAuthenticationPresentationContextProviding, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    public let identifier = "NativeAuthPlugin"
    public let jsName = "NativeAuth"
    public let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise), CAPPluginMethod(name: "apple", returnType: CAPPluginReturnPromise)]
    private var appleCall: CAPPluginCall?
    private var appleController: ASAuthorizationController?
    private var appleState: String?
    private var session: ASWebAuthenticationSession?
    private var anchor: UIWindow?
    private var revocationObserver: NSObjectProtocol?

    public override func load() {
        revocationObserver = NotificationCenter.default.addObserver(
            forName: ASAuthorizationAppleIDProvider.credentialRevokedNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.notifyListeners("appleCredentialRevoked", data: [:], retainUntilConsumed: true)
        }
    }

    deinit {
        if let observer = revocationObserver {
            NotificationCenter.default.removeObserver(observer)
        }
    }

    @objc func start(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard self.session == nil, self.appleCall == nil else { call.reject("Sign-in is already in progress."); return }
            guard let value = call.getString("url"), let url = URL(string: value),
                  url.scheme == "https", url.host == "parently-babytracking.com", url.port == nil,
                  url.user == nil, url.password == nil, url.fragment == nil,
                  url.path == "/~oauth/initiate",
                  let items = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems,
                  let provider = items.first(where: { $0.name == "provider" })?.value,
                  ["apple", "google"].contains(provider),
                  let redirectValue = items.first(where: { $0.name == "redirect_uri" })?.value,
                  let redirect = URL(string: redirectValue),
                  redirect.scheme == "https", redirect.host == url.host, redirect.port == nil,
                  redirect.user == nil, redirect.password == nil, redirect.fragment == nil,
                  redirect.path == "/native-auth-callback.html" else {
                call.reject("Invalid authentication URL."); return
            }
            guard let window = self.bridge?.viewController?.view.window else {
                call.reject("Unable to present sign-in."); return
            }
            self.anchor = window
            let session = ASWebAuthenticationSession(url: url, callbackURLScheme: "com.parentlybabytracking.app") { callback, error in
                DispatchQueue.main.async {
                    self.session = nil
                    self.anchor = nil
                    if let callback = callback { call.resolve(["url": callback.absoluteString]) }
                    else { call.reject("Sign-in was cancelled or could not be completed.") }
                }
            }
            session.presentationContextProvider = self
            self.session = session
            if !session.start() {
                self.session = nil
                self.anchor = nil
                call.reject("Unable to open secure sign-in.")
            }
        }
    }

    @objc func apple(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard self.session == nil, self.appleCall == nil else { call.reject("Sign-in is already in progress."); return }
            guard let nonce = call.getString("nonce"), nonce.range(of: "^[a-f0-9]{64}$", options: .regularExpression) != nil else {
                call.reject("Invalid sign-in request."); return
            }
            guard let window = self.bridge?.viewController?.view.window else { call.reject("Unable to present Apple sign-in."); return }
            self.anchor = window
            self.appleCall = call
            let request = ASAuthorizationAppleIDProvider().createRequest()
            request.requestedScopes = [.fullName, .email]
            request.nonce = SHA256.hash(data: Data(nonce.utf8)).map { String(format: "%02x", $0) }.joined()
            let state = UUID().uuidString
            self.appleState = state
            request.state = state
            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            self.appleController = controller
            controller.performRequests()
        }
    }

    private func finishApple() {
        appleCall = nil
        appleController = nil
        appleState = nil
        anchor = nil
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let call = appleCall else { return }
        defer { finishApple() }
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              credential.state == appleState,
              let tokenData = credential.identityToken, let token = String(data: tokenData, encoding: .utf8),
              let codeData = credential.authorizationCode, let code = String(data: codeData, encoding: .utf8) else {
            call.reject("Apple sign-in did not return a valid authorization."); return
        }
        var result: [String: Any] = ["identityToken": token, "authorizationCode": code]
        if let name = credential.fullName {
            let formatted = PersonNameComponentsFormatter().string(from: name)
            if !formatted.isEmpty { result["fullName"] = formatted }
        }
        call.resolve(result)
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        appleCall?.reject("Apple sign-in was cancelled or could not be completed.")
        finishApple()
    }

    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return anchor ?? ASPresentationAnchor()
    }

    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        return anchor ?? ASPresentationAnchor()
    }
}

class ParentlyBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeAuthPlugin())
    }
}
