-- Add nearby places and contact info to hotels table
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS nearby_places JSONB,
ADD COLUMN IF NOT EXISTS contact_number TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Update the single image_url to be part of images array for existing records
UPDATE public.hotels 
SET images = ARRAY[image_url] 
WHERE images IS NULL AND image_url IS NOT NULL;