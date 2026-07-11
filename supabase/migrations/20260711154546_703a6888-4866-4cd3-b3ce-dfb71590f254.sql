
CREATE POLICY "baby-photos own select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'baby-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "baby-photos own insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'baby-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "baby-photos own update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'baby-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "baby-photos own delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'baby-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
