import AuthenticationServices
import Capacitor

@objc(NativeAuthPlugin)
public class NativeAuthPlugin: CAPPlugin, CAPBridgedPlugin, ASWebAuthenticationPresentationContextProviding {
    public let identifier = "NativeAuthPlugin"
    public let jsName = "NativeAuth"
    public let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise)]
    private var session: ASWebAuthenticationSession?
    private var anchor: UIWindow?

    @objc func start(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard self.session == nil else { call.reject("Sign-in is already in progress."); return }
            guard let value = call.getString("url"), let url = URL(string: value),
                  url.scheme == "https", url.host == "emyrcjsikkdnublfudmj.supabase.co",
                  url.path == "/auth/v1/authorize" else {
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

    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        return anchor ?? ASPresentationAnchor()
    }
}

class ParentlyBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeAuthPlugin())
    }
}
