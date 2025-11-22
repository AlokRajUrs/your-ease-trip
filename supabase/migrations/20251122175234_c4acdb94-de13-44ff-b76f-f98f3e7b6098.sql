-- Add images array field to destinations table for photo gallery
ALTER TABLE public.destinations
ADD COLUMN images text[] DEFAULT ARRAY[]::text[];