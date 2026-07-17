ALTER TABLE public.profiles
  ADD COLUMN stage TEXT CHECK (stage IN ('pregnancy','newborn','baby','toddler','preschool')),
  ADD COLUMN due_date DATE,
  ADD COLUMN birth_date DATE;
