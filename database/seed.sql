-- Salon Management System Initial Seed Data (Indian Salon Context)
USE `salon_db`;

-- Clear existing data in correct FK order
DELETE FROM `reviews`;
DELETE FROM `payments`;
DELETE FROM `appointments`;
DELETE FROM `customers`;
DELETE FROM `services`;
DELETE FROM `categories`;
DELETE FROM `stylists`;
DELETE FROM `admins`;

-- Table 1: Categories
INSERT INTO `categories` (`id`, `name`, `description`, `icon`) VALUES
(1, 'Hair Care & Precision Cuts', 'Professional haircuts, blow-dry styling, and signature head wash for men & women.', 'scissors'),
(2, 'Color, Streaks & Hair Spa', 'Global hair coloring, balayage, organic root touch-ups, and intense keratin spa.', 'palette'),
(3, 'Skin Care, D-Tan & Facials', 'O3+ brightening facials, fruit cleanups, herbal D-Tan packs, and skin rejuvenation.', 'sparkles'),
(4, 'Beard & Men\'s Grooming', 'Traditional hot towel shaves, beard trimming & styling, moustache grooming, and face detox.', 'user-check'),
(5, 'Bridal, Nail Art & Makeover', 'Pre-bridal skin glow, bridal makeup packages, gel extensions, and royal pedicure spa.', 'hand');

-- Table 2: Services (Prices in INR ₹)
INSERT INTO `services` (`id`, `category_id`, `name`, `description`, `duration_mins`, `price`, `image_url`, `status`) VALUES
(1, 1, 'Executive Haircut & Styling', 'Custom face-shape haircut with clarifying hair wash, soothing scalp massage, and blow-dry styling.', 40, 250.00, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80', 'Active'),
(2, 1, 'Ayurvedic Herbal Hair Spa & Champi', 'Traditional warm herbal oil champi massage with steam therapy and nourishing hair mask.', 50, 650.00, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 'Active'),
(3, 2, 'Global Color & Highlights (Balayage)', 'Premium ammonia-free color with custom high-contrast streaks and gloss locking serum.', 120, 1800.00, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80', 'Active'),
(4, 2, 'Organic Root Touch-Up', 'Seamless grey coverage root touch-up with ammonia-free herbal enriched formulation.', 45, 750.00, 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80', 'Active'),
(5, 3, 'O3+ Brightening & D-Tan Facial', 'Deep pore cleansing, multi-active tan removal scrub, brightening mask, and serum boost.', 60, 950.00, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80', 'Active'),
(6, 3, 'Gold Radiance Glow Facial', 'Luxury 24K gold foil facial massage for instant skin rejuvenation, glow, and elasticity.', 75, 1450.00, 'https://images.unsplash.com/photo-1512290900673-700207402636?auto=format&fit=crop&w=600&q=80', 'Active'),
(7, 4, 'Royal Hot Towel Shave & Beard Styling', 'Steam hot towel prep, precision straight razor beard lining, and cooling sandalwood aftershave.', 35, 350.00, 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80', 'Active'),
(8, 4, 'Beard Sculpt & Charcoal Detox Face Mask', 'Detailed beard fade shaping accompanied by an activated charcoal blackhead peel mask.', 45, 550.00, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80', 'Active'),
(9, 5, 'Luxury Gel Nail Art & Manicure', 'Cuticle maintenance, hand exfoliation scrub, durable gel polish, and custom nail art.', 60, 850.00, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80', 'Active'),
(10, 5, 'Royal Pedicure & Foot Reflexology', 'Warm herbal water foot soak, dead skin exfoliation, paraffin wax therapy, and foot massage.', 60, 750.00, 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80', 'Active'),
(11, 5, 'Pre-Bridal Glow & Makeover Package', 'Complete bridal beauty ritual: full body polishing, gold facial, hair spa, and party makeup.', 180, 4999.00, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80', 'Active');

-- Table 3: Stylists / Staff (Indian Salon Specialists)
INSERT INTO `stylists` (`id`, `name`, `title`, `bio`, `email`, `phone`, `avatar_url`, `rating`, `status`) VALUES
(1, 'Rajesh Sharma', 'Master Hair Stylist & Creative Director', '12+ years expertise in precision haircuts, modern fades, and bridal hair couture.', 'rajesh.sharma@salon.in', '+91 98231 45678', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 4.95, 'Active'),
(2, 'Priya Patel', 'Senior Skin Aesthetician & Bridal Makeup Artist', 'Certified cosmetologist specializing in D-Tan treatments, hydra facials, and wedding makeovers.', 'priya.patel@salon.in', '+91 98452 78901', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 4.92, 'Active'),
(3, 'Amit Verma', 'Lead Barber & Beard Grooming Specialist', 'Renowned for sharp razor finishes, beard fading, and traditional hot towel grooming rituals.', 'amit.verma@salon.in', '+91 97123 34567', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 4.88, 'Active'),
(4, 'Sunita Roy', 'Nail Art Specialist & Hair Spa Therapist', 'Expert in gel nail architecture, cuticle aesthetics, and deeply relaxing Ayurvedic head massage.', 'sunita.roy@salon.in', '+91 98980 12345', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', 4.90, 'Active');

-- Table 4: Customers (With default password '123456')
INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `password`, `total_visits`) VALUES
(1, 'Rahul Sharma', 'rahul.sharma@gmail.com', '9876543210', '123456', 4),
(2, 'Ananya Iyer', 'ananya.iyer@gmail.com', '9765432109', '123456', 6),
(3, 'Vikram Malhotra', 'vikram.m@gmail.com', '9654321098', '123456', 2),
(4, 'Sneha Kulkarni', 'sneha.k@gmail.com', '9543210987', '123456', 1);

-- Table 5: Appointments
INSERT INTO `appointments` (`id`, `ref_code`, `customer_id`, `stylist_id`, `service_id`, `appointment_date`, `appointment_time`, `status`, `notes`, `total_price`, `payment_status`) VALUES
(1, 'SLN-8921', 1, 1, 1, CURDATE(), '10:30:00', 'Confirmed', 'Executive haircut with side fade styling.', 250.00, 'Paid'),
(2, 'SLN-8922', 2, 2, 5, CURDATE(), '12:00:00', 'In-Progress', 'O3+ D-Tan treatment before family function.', 950.00, 'Paid'),
(3, 'SLN-8923', 3, 3, 7, CURDATE(), '15:30:00', 'Pending', 'Beard trim and traditional hot towel shave.', 350.00, 'Unpaid'),
(4, 'SLN-8924', 4, 4, 9, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:00:00', 'Confirmed', 'French manicure with glitter gel extensions.', 850.00, 'Unpaid');

-- Table 6: Payments / Invoices (Indian Payment Modes)
INSERT INTO `payments` (`id`, `appointment_id`, `payment_method`, `amount`, `transaction_ref`) VALUES
(1, 1, 'UPI', 250.00, 'UPI/PAYTM/491029381'),
(2, 2, 'UPI', 950.00, 'UPI/GPAY/982301928');

-- Table 7: Reviews
INSERT INTO `reviews` (`id`, `customer_name`, `rating`, `comment`, `service_name`) VALUES
(1, 'Rohit Deshmukh', 5, 'Rajesh bhaiya gave me the sharpest haircut and fade I have ever had! The scalp massage was so relaxing.', 'Executive Haircut & Styling'),
(2, 'Meera Nair', 5, 'Priya di did a fantastic job with my O3+ D-Tan facial. My skin looked glowing and fresh for the wedding reception.', 'O3+ Brightening & D-Tan Facial'),
(3, 'Karan Grover', 5, 'Amit is a master with the straight razor. Best hot towel shave experience in town. UPI payment was quick and smooth.', 'Royal Hot Towel Shave & Beard Styling');

-- Table 8: Admins (Default Credentials: username: admin / password: admin123)
INSERT INTO `admins` (`id`, `username`, `password`, `full_name`, `email`, `role`) VALUES
(1, 'admin', 'admin123', 'Salon Manager', 'admin@salon.in', 'Admin');
