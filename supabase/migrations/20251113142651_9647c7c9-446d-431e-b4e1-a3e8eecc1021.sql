-- Add new fields to destinations table for detailed place information
ALTER TABLE public.destinations
ADD COLUMN IF NOT EXISTS visiting_hours text,
ADD COLUMN IF NOT EXISTS entry_fee text,
ADD COLUMN IF NOT EXISTS transport_details text,
ADD COLUMN IF NOT EXISTS distance_from_town text,
ADD COLUMN IF NOT EXISTS travel_time text,
ADD COLUMN IF NOT EXISTS location_coordinates text;

-- Insert Chikkamagaluru places
INSERT INTO public.destinations (name, country, description, image_url, featured, best_time_to_visit, highlights, visiting_hours, entry_fee, transport_details, distance_from_town, travel_time, location_coordinates)
VALUES 
(
  'Mullayanagiri Peak',
  'Chikkamagaluru, Karnataka, India',
  'The highest peak in Karnataka, famous for sunrise treks and panoramic views of the Western Ghats. This magnificent mountain offers breathtaking vistas and is a must-visit for trekking enthusiasts and nature lovers.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  true,
  'September to March',
  ARRAY['Highest peak in Karnataka', 'Sunrise trekking', 'Panoramic Western Ghats views', 'Adventure activities', 'Photography spots'],
  'Open 24 hours (Best time: Early morning for sunrise)',
  'Free entry',
  'Accessible by car, bike, or cab. Nearest bus stop: Seethalayyanagiri. Road is motorable but steep in some sections. Parking available near the peak.',
  '20 km from Chikkamagaluru town',
  '45 minutes by car or cab',
  '13.3892,75.7181'
),
(
  'Abbey Falls',
  'Chikkamagaluru, Karnataka, India',
  'A stunning waterfall surrounded by lush coffee plantations, offering a serene nature walk experience. The falls cascade beautifully through the verdant landscape, creating a perfect retreat for nature enthusiasts.',
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80',
  true,
  'July to October (Monsoon season)',
  ARRAY['Surrounded by coffee estates', 'Nature walks', 'Photography paradise', 'Scenic beauty', 'Peaceful atmosphere'],
  '9:00 AM to 5:00 PM',
  '₹20 per person',
  'Easy access by taxi or rental scooter. Parking available near entrance. Short walk from parking to falls viewpoint.',
  '8 km from Chikkamagaluru town',
  '20 minutes by vehicle',
  '13.2846,75.7185'
),
(
  'Kalhatti Falls (Kalathgiri Falls)',
  'Chikkamagaluru, Karnataka, India',
  'A magnificent waterfall flowing over the ancient Veerabhadreshwara Temple, combining scenic natural beauty with spiritual serenity. The falls are especially spectacular during monsoon.',
  'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80',
  false,
  'August to February',
  ARRAY['Temple at the base', 'Spiritual significance', 'Scenic waterfall', 'Trekking trails', 'Natural beauty'],
  '6:00 AM to 6:00 PM',
  'Free entry (donations welcome at temple)',
  '10 km from Kemmangundi; 1 hour drive from Chikkamagaluru via Lingadahalli. Limited bus service, private vehicle recommended. Steps lead down to the temple and falls.',
  '50 km from Chikkamagaluru town',
  '1 hour 15 minutes by car',
  '13.4167,75.5833'
),
(
  'Baba Budangiri Hills',
  'Chikkamagaluru, Karnataka, India',
  'Sacred hills known for mysterious caves, challenging trekking trails, and expansive coffee plantations. This pilgrimage spot holds religious significance for both Hindus and Muslims, offering spiritual solace amid natural grandeur.',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  true,
  'October to March',
  ARRAY['Sacred pilgrimage site', 'Cave exploration', 'Coffee plantations', 'Trekking trails', 'Panoramic mountain views'],
  'Open 24 hours (Temple: 6:00 AM to 7:00 PM)',
  'Free entry',
  '33 km from Chikkamagaluru; 1 hour by jeep or private cab. Regular buses available till Attigundi village, then local transport needed. Road is winding with sharp turns.',
  '33 km from Chikkamagaluru town',
  '1 hour by vehicle',
  '13.4167,75.7667'
),
(
  'Hebbe Falls',
  'Chikkamagaluru, Karnataka, India',
  'Twin waterfalls cascading through the dense Bhadra Wildlife Sanctuary. The journey through coffee estates in a rugged jeep adds adventure to the scenic beauty. A perfect blend of thrill and natural splendor.',
  'https://images.unsplash.com/photo-1518623001395-125242310d0c?w=800&q=80',
  true,
  'August to January',
  ARRAY['Twin waterfalls', 'Wildlife sanctuary', 'Jeep safari through coffee estates', 'Adventure activity', 'Pristine nature'],
  '8:00 AM to 5:00 PM',
  '₹300-500 per person (includes jeep ride)',
  '10 km from Kemmangundi; accessible only by forest jeep (4x4). Regular vehicles not permitted. 1.5 hours from Chikkamagaluru town. Jeeps available at Kemmangundi base.',
  '40 km from Chikkamagaluru town',
  '1 hour 30 minutes + jeep ride',
  '13.4500,75.6333'
),
(
  'Hirekolale Lake',
  'Chikkamagaluru, Karnataka, India',
  'A serene man-made lake surrounded by rolling hills and lush greenery. Perfect for sunset viewing, picnics, and peaceful moments. The lake offers stunning reflections of the surrounding mountains.',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80',
  false,
  'September to May',
  ARRAY['Scenic lake views', 'Sunset photography', 'Peaceful atmosphere', 'Mountain reflections', 'Picnic spot'],
  'Open 24 hours',
  'Free entry',
  'Easy access by car or bike. Located on Chikkamagaluru-Tarikere route. Well-maintained road. Parking available near the lake. No public transport directly to the lake.',
  '12 km from Chikkamagaluru town',
  '25 minutes by vehicle',
  '13.3500,75.8167'
);

-- Update existing destinations to set them as Chikkamagaluru destinations if needed
COMMENT ON COLUMN public.destinations.transport_details IS 'Detailed transport information including bus stops, parking, accessibility';
COMMENT ON COLUMN public.destinations.distance_from_town IS 'Distance from main town/city';
COMMENT ON COLUMN public.destinations.travel_time IS 'Approximate travel time from main town';