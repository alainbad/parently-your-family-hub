CREATE TABLE public.growth_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_at DATE NOT NULL,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  head_circumference_cm NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (weight_kg IS NOT NULL OR height_cm IS NOT NULL OR head_circumference_cm IS NOT NULL)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.growth_measurements TO authenticated;
GRANT ALL ON public.growth_measurements TO service_role;

ALTER TABLE public.growth_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own growth_measurements"
ON public.growth_measurements
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX growth_measurements_user_date_idx ON public.growth_measurements (user_id, measured_at);
