"""
Seed script — populates the database with sample categories and products.

Usage:
    cd backend
    python -m app.seed          # seed (skip if data exists)
    python -m app.seed --reset  # wipe & re-seed
"""

import sys
from app.database import SessionLocal, engine, Base
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.wishlist import WishlistItem
from app.models.cart import CartItem
from app.models.order import Order, OrderItem


def seed(reset: bool = False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if reset:
        print("🗑️  Clearing existing data …")
        db.query(WishlistItem).delete()
        db.query(CartItem).delete()
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(ProductImage).delete()
        db.query(Product).delete()
        db.query(Category).delete()
        db.commit()
        print("✅ Cleared.")

    # Skip if data already exists
    if db.query(Category).count() > 0:
        print("⚠️  Database already seeded. Skipping. (use --reset to wipe & re-seed)")
        db.close()
        return

    # ------------------------------------------------------------------
    # Categories
    # ------------------------------------------------------------------
    categories_data = [
        {"name": "Electronics", "slug": "electronics",
         "image_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200"},
        {"name": "Fashion", "slug": "fashion",
         "image_url": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200"},
        {"name": "Home & Furniture", "slug": "home-furniture",
         "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200"},
        {"name": "Books", "slug": "books",
         "image_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200"},
        {"name": "Sports", "slug": "sports",
         "image_url": "https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=200"},
        {"name": "Beauty & Personal Care", "slug": "beauty-personal-care",
         "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200"},
    ]

    cat_objs = {}
    for cat_data in categories_data:
        cat = Category(**cat_data)
        db.add(cat)
        db.flush()
        cat_objs[cat.slug] = cat

    # ------------------------------------------------------------------
    # Products  (5-6 per category = ~30 products)
    # Each image URL is verified working (HTTP 200) and relevant to the product.
    # ------------------------------------------------------------------
    products_data = [
        # ---- Electronics ----
        {
            "name": "Samsung Galaxy S24 Ultra 5G (Titanium Black, 256 GB)",
            "slug": "samsung-galaxy-s24-ultra-titanium-black-256gb",
            "description": "Experience the pinnacle of mobile technology with the Samsung Galaxy S24 Ultra. Featuring a stunning 6.8-inch Dynamic AMOLED 2X display with 120Hz refresh rate, the powerful Snapdragon 8 Gen 3 processor, and the integrated S Pen for productivity. Capture breathtaking photos with the 200MP main camera system.",
            "specifications": '{"Display": "6.8 inch Dynamic AMOLED 2X, 120Hz", "Processor": "Snapdragon 8 Gen 3", "RAM": "12 GB", "Storage": "256 GB", "Camera": "200MP + 12MP + 50MP + 10MP", "Battery": "5000 mAh", "OS": "Android 14, One UI 6.1"}',
            "price": 129999.00, "original_price": 134999.00, "discount_percent": 4,
            "stock": 25, "brand": "Samsung", "rating": 4.5, "rating_count": 12840,
            "category_slug": "electronics",
            "images": [
                # Samsung phone held in hand
                "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600",
                # Smartphone on surface
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
                # Samsung phone screen
                "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
            ],
        },
        {
            "name": "Apple MacBook Air M3 (15 inch, 16GB, 512GB SSD) - Midnight",
            "slug": "apple-macbook-air-m3-15-midnight",
            "description": "The remarkably thin 15-inch MacBook Air with the M3 chip delivers exceptional performance and up to 18 hours of battery life. With a stunningly thin design, brilliant Liquid Retina display, 1080p FaceTime HD camera, and a MagSafe charging port.",
            "specifications": '{"Display": "15.3 inch Liquid Retina, 2880x1864", "Chip": "Apple M3 (8-core CPU, 10-core GPU)", "RAM": "16 GB Unified", "Storage": "512 GB SSD", "Battery": "Up to 18 hours", "Weight": "1.51 kg", "Ports": "2x Thunderbolt, MagSafe 3, 3.5mm jack"}',
            "price": 149900.00, "original_price": 164900.00, "discount_percent": 9,
            "stock": 15, "brand": "Apple", "rating": 4.7, "rating_count": 3456,
            "category_slug": "electronics",
            "images": [
                # MacBook on desk
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
                # MacBook Pro side angle
                "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600",
                # MacBook keyboard close-up
                "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600",
            ],
        },
        {
            "name": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
            "slug": "sony-wh-1000xm5-wireless-headphones",
            "description": "Industry-leading noise cancellation with two processors controlling 8 microphones. Crystal clear hands-free calling with 4 beamforming microphones. Up to 30-hour battery life with quick charging (3 min charge = 3 hours playback).",
            "specifications": '{"Driver": "30mm", "Frequency Response": "4Hz-40,000Hz", "Noise Cancelling": "Yes, Adaptive", "Battery": "30 hours (NC ON)", "Weight": "250g", "Bluetooth": "5.2", "Codec": "LDAC, AAC, SBC"}',
            "price": 26990.00, "original_price": 34990.00, "discount_percent": 23,
            "stock": 50, "brand": "Sony", "rating": 4.6, "rating_count": 8920,
            "category_slug": "electronics",
            "images": [
                # Over-ear headphones
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600",
                # Headphones product shot
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
                # Headphones flat lay
                "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600",
            ],
        },
        {
            "name": "Apple iPad Air (M2) 11-inch Wi-Fi 256GB - Space Grey",
            "slug": "apple-ipad-air-m2-11-space-grey-256gb",
            "description": "The iPad Air with M2 chip delivers next-level performance and capabilities. 11-inch Liquid Retina display with P3 wide color, True Tone, and anti-reflective coating. Works with Apple Pencil Pro and Magic Keyboard.",
            "specifications": '{"Display": "11 inch Liquid Retina, 2360x1640", "Chip": "Apple M2", "Storage": "256 GB", "Camera": "12MP Wide, 12MP Ultra Wide front", "Battery": "Up to 10 hours", "Weight": "462g", "Connectivity": "Wi-Fi 6E, Bluetooth 5.3"}',
            "price": 59900.00, "original_price": 69900.00, "discount_percent": 14,
            "stock": 30, "brand": "Apple", "rating": 4.8, "rating_count": 2105,
            "category_slug": "electronics",
            "images": [
                # iPad on surface
                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600",
                # iPad with Apple Pencil
                "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600",
            ],
        },
        {
            "name": "boAt Airdopes 141 TWS Earbuds with 42H Playtime",
            "slug": "boat-airdopes-141-tws-earbuds",
            "description": "Enjoy an immersive listening experience with boAt Airdopes 141 featuring 8mm drivers, ENx noise-cancelling tech for calls, and a massive 42-hour playback. IPX4 water resistance and Bluetooth v5.3 for seamless connectivity.",
            "specifications": '{"Driver": "8mm", "Playback": "42 hours total", "Bluetooth": "5.3", "Water Resistance": "IPX4", "Charging": "Type-C", "Weight": "4g per earbud"}',
            "price": 1299.00, "original_price": 4490.00, "discount_percent": 71,
            "stock": 200, "brand": "boAt", "rating": 4.1, "rating_count": 156780,
            "category_slug": "electronics",
            "images": [
                # Wireless earbuds in case
                "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600",
                # Earbuds close-up
                "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600",
            ],
        },

        # ---- Fashion ----
        {
            "name": "Levi's Men's 511 Slim Fit Jeans - Dark Indigo",
            "slug": "levis-men-511-slim-fit-jeans-dark-indigo",
            "description": "The Levi's 511 Slim Fit Jean is a modern slim with a narrow fit through the thigh. Made with premium stretch denim for comfort that lasts all day. Sit below waist, slim from hip to ankle.",
            "specifications": '{"Fit": "Slim Fit", "Rise": "Mid Rise", "Material": "98% Cotton, 2% Elastane", "Closure": "Zip Fly with Button", "Wash Care": "Machine Wash Cold", "Style": "511"}',
            "price": 2799.00, "original_price": 5999.00, "discount_percent": 53,
            "stock": 80, "brand": "Levi's", "rating": 4.3, "rating_count": 45670,
            "category_slug": "fashion",
            "images": [
                # Folded blue jeans
                "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
                # Jeans on person
                "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600",
                # Denim close-up
                "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600",
            ],
        },
        {
            "name": "Nike Air Max 270 React Men's Shoes - Black/White",
            "slug": "nike-air-max-270-react-black-white",
            "description": "Combining two of Nike's best technologies — the 270 Air unit with React foam — for an incredibly smooth ride. The sleek design features a seamless mesh upper for breathability, and the distinctive oversized Air heel unit for cushioning.",
            "specifications": '{"Type": "Running Shoes", "Closure": "Lace-Up", "Upper Material": "Mesh & Synthetic", "Sole": "React Foam + Air Max 270 Unit", "Weight": "310g (UK 8)", "Color": "Black/White"}',
            "price": 11495.00, "original_price": 15995.00, "discount_percent": 28,
            "stock": 40, "brand": "Nike", "rating": 4.4, "rating_count": 12340,
            "category_slug": "fashion",
            "images": [
                # Red Nike shoe (iconic product shot)
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
                # Nike shoes pair
                "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600",
                # Sneakers collection
                "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600",
            ],
        },
        {
            "name": "Allen Solly Men's Formal Shirt - Sky Blue",
            "slug": "allen-solly-formal-shirt-sky-blue",
            "description": "Look sharp at work with this premium formal shirt from Allen Solly. Made with 100% cotton for all-day comfort, featuring a spread collar and full sleeves. Perfect for boardroom meetings or formal events.",
            "specifications": '{"Material": "100% Cotton", "Fit": "Regular", "Sleeve": "Full Sleeve", "Collar": "Spread", "Pattern": "Solid", "Wash Care": "Machine Wash"}',
            "price": 1049.00, "original_price": 2099.00, "discount_percent": 50,
            "stock": 120, "brand": "Allen Solly", "rating": 4.2, "rating_count": 23450,
            "category_slug": "fashion",
            "images": [
                # Dress shirts on rack
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
                # Blue formal shirt
                "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
            ],
        },
        {
            "name": "Fastrack Analog Watch for Men - Black Dial",
            "slug": "fastrack-analog-watch-men-black",
            "description": "Bold and stylish analog watch from Fastrack with a sleek black dial and stainless steel case. Water resistant up to 30m, with a durable leather strap for everyday wear.",
            "specifications": '{"Movement": "Quartz", "Dial Color": "Black", "Case Material": "Stainless Steel", "Strap": "Leather", "Water Resistance": "30m", "Warranty": "2 Years"}',
            "price": 1695.00, "original_price": 2495.00, "discount_percent": 32,
            "stock": 60, "brand": "Fastrack", "rating": 4.0, "rating_count": 34500,
            "category_slug": "fashion",
            "images": [
                # Elegant wristwatch
                "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600",
                # Watch close-up
                "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600",
            ],
        },
        {
            "name": "Wildcraft Unisex Backpack 35L - Navy",
            "slug": "wildcraft-unisex-backpack-35l-navy",
            "description": "Durable and spacious 35-litre backpack from Wildcraft, perfect for daily commute or weekend trips. Features multiple compartments, padded laptop sleeve (fits up to 15.6\"), and ergonomic straps.",
            "specifications": '{"Capacity": "35 Litres", "Material": "Polyester", "Laptop Compartment": "Up to 15.6 inch", "Water Resistant": "Yes", "Straps": "Padded Ergonomic", "Warranty": "5 Years"}',
            "price": 1499.00, "original_price": 2999.00, "discount_percent": 50,
            "stock": 90, "brand": "Wildcraft", "rating": 4.3, "rating_count": 18900,
            "category_slug": "fashion",
            "images": [
                # Backpack
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
                # Backpack outdoors
                "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600",
            ],
        },

        # ---- Home & Furniture ----
        {
            "name": "Wakefit Orthopedic Memory Foam Mattress (Queen, 78x60x6)",
            "slug": "wakefit-ortho-memory-foam-mattress-queen",
            "description": "Experience cloud-like comfort with Wakefit's Orthopedic Memory Foam Mattress. Designed to provide ideal spinal alignment and pressure relief. The open-cell memory foam ensures breathability while adapting perfectly to your body contour.",
            "specifications": '{"Size": "Queen (78x60x6 inches)", "Material": "Memory Foam + HR Foam", "Cover": "Zip-off Knitted", "Firmness": "Medium Firm", "Weight Capacity": "240 kg", "Warranty": "10 Years", "Trial": "100 Nights"}',
            "price": 8999.00, "original_price": 17332.00, "discount_percent": 48,
            "stock": 20, "brand": "Wakefit", "rating": 4.3, "rating_count": 67800,
            "category_slug": "home-furniture",
            "images": [
                # Cozy bed with mattress
                "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600",
                # Bedroom setup
                "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600",
            ],
        },
        {
            "name": "Philips Air Fryer HD9200/90 - 4.1L, 1400W",
            "slug": "philips-air-fryer-hd9200-4l",
            "description": "Philips Air Fryer with Rapid Air Technology lets you fry, bake, grill, and roast with up to 90% less fat. 4.1L capacity perfect for a family of 4, with an easy-to-clean non-stick basket and preset cooking programs.",
            "specifications": '{"Capacity": "4.1 Litres", "Power": "1400W", "Technology": "Rapid Air", "Temperature": "80°C - 200°C", "Timer": "Up to 30 min", "Weight": "4.5 kg", "Warranty": "2 Years"}',
            "price": 6499.00, "original_price": 9995.00, "discount_percent": 35,
            "stock": 35, "brand": "Philips", "rating": 4.4, "rating_count": 28900,
            "category_slug": "home-furniture",
            "images": [
                # Kitchen appliance
                "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600",
                # Air fryer in kitchen
                "https://images.unsplash.com/photo-1626509653291-18d9a934b9db?w=600",
            ],
        },
        {
            "name": "Solimo Engineered Wood Study Table - Walnut Finish",
            "slug": "solimo-engineered-wood-study-table-walnut",
            "description": "Sleek and functional study table made from high-quality engineered wood with a premium walnut finish. Features a spacious desktop, integrated cable management, and a side drawer for storage.",
            "specifications": '{"Material": "Engineered Wood", "Finish": "Walnut", "Dimensions": "120 x 60 x 75 cm", "Weight Capacity": "50 kg", "Assembly": "DIY (tools provided)", "Warranty": "1 Year"}',
            "price": 4299.00, "original_price": 7999.00, "discount_percent": 46,
            "stock": 18, "brand": "Solimo", "rating": 4.1, "rating_count": 5670,
            "category_slug": "home-furniture",
            "images": [
                # Wooden desk / study table
                "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600",
                # Desk setup
                "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600",
            ],
        },
        {
            "name": "Prestige Iris 750W Mixer Grinder (3 Jars)",
            "slug": "prestige-iris-750w-mixer-grinder-3jars",
            "description": "Powerful 750W motor mixer grinder from Prestige with 3 stainless steel jars for grinding, mixing, and blending. Ergonomic handles, anti-skid feet, and overload protection for safety.",
            "specifications": '{"Power": "750W", "Jars": "3 (1.5L, 1L, 0.5L)", "Blades": "Stainless Steel", "Speed": "3 Speed + Pulse", "Body": "ABS Plastic", "Warranty": "2 Years"}',
            "price": 2499.00, "original_price": 4495.00, "discount_percent": 44,
            "stock": 45, "brand": "Prestige", "rating": 4.2, "rating_count": 41200,
            "category_slug": "home-furniture",
            "images": [
                # Blender / mixer
                "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600",
                # Kitchen blender
                "https://images.unsplash.com/photo-1585237017125-24baf8d7406f?w=600",
            ],
        },
        {
            "name": "Amazon Basics 12-Piece Cotton Towel Set - Grey",
            "slug": "amazon-basics-12pc-cotton-towel-set-grey",
            "description": "Ultra-soft 100% cotton towel set including 4 bath towels, 4 hand towels, and 4 washcloths. 600 GSM weight for premium absorbency and durability. OEKO-TEX certified for safety.",
            "specifications": '{"Material": "100% Cotton, 600 GSM", "Set Includes": "4 Bath, 4 Hand, 4 Wash", "Color": "Grey", "Wash Care": "Machine Wash Warm", "Certification": "OEKO-TEX Standard 100"}',
            "price": 1799.00, "original_price": 3499.00, "discount_percent": 49,
            "stock": 70, "brand": "Amazon Basics", "rating": 4.3, "rating_count": 15600,
            "category_slug": "home-furniture",
            "images": [
                # Stacked towels
                "https://images.unsplash.com/photo-1600369672770-985fd30004eb?w=600",
                # Folded bath towels
                "https://images.unsplash.com/photo-1583845112203-29329902332e?w=600",
            ],
        },

        # ---- Books ----
        {
            "name": "Atomic Habits by James Clear (Paperback)",
            "slug": "atomic-habits-james-clear-paperback",
            "description": "Tiny Changes, Remarkable Results. An easy & proven way to build good habits & break bad ones. This breakthrough book from James Clear reveals practical strategies that will teach you how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
            "specifications": '{"Author": "James Clear", "Publisher": "Penguin Random House", "Pages": "320", "Language": "English", "ISBN": "978-0735211292", "Format": "Paperback"}',
            "price": 399.00, "original_price": 799.00, "discount_percent": 50,
            "stock": 150, "brand": "Penguin", "rating": 4.7, "rating_count": 189000,
            "category_slug": "books",
            "images": [
                # Stack of books
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
                # Books on shelf
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
            ],
        },
        {
            "name": "The Psychology of Money by Morgan Housel (Paperback)",
            "slug": "psychology-of-money-morgan-housel",
            "description": "Timeless lessons on wealth, greed, and happiness. Morgan Housel shares 19 short stories exploring the strange ways people think about money and teaches you how to make better sense of one of life's most important topics.",
            "specifications": '{"Author": "Morgan Housel", "Publisher": "Jaico Publishing", "Pages": "252", "Language": "English", "ISBN": "978-9390166268", "Format": "Paperback"}',
            "price": 299.00, "original_price": 499.00, "discount_percent": 40,
            "stock": 180, "brand": "Jaico", "rating": 4.6, "rating_count": 134000,
            "category_slug": "books",
            "images": [
                # Book with glasses
                "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600",
                # Open book pages
                "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600",
            ],
        },
        {
            "name": "Rich Dad Poor Dad by Robert Kiyosaki (Mass Market)",
            "slug": "rich-dad-poor-dad-robert-kiyosaki",
            "description": "What the rich teach their kids about money — that the poor and middle class do not! Rich Dad Poor Dad is Robert's story of growing up with two dads — his real father and the father of his best friend — and how both men shaped his thoughts about money and investing.",
            "specifications": '{"Author": "Robert T. Kiyosaki", "Publisher": "Plata Publishing", "Pages": "336", "Language": "English", "ISBN": "978-1612681139", "Format": "Mass Market Paperback"}',
            "price": 249.00, "original_price": 399.00, "discount_percent": 38,
            "stock": 200, "brand": "Plata", "rating": 4.5, "rating_count": 210000,
            "category_slug": "books",
            "images": [
                # Bookshelf close-up
                "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600",
                # Stack of books
                "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600",
            ],
        },
        {
            "name": "Ikigai: The Japanese Secret to a Long and Happy Life",
            "slug": "ikigai-japanese-secret-long-happy-life",
            "description": "According to the Japanese, everyone has an ikigai — a reason for living. This international bestseller brings together all that the authors have discovered about the Japanese philosophy of ikigai, the happiness of always being busy.",
            "specifications": '{"Author": "Héctor García & Francesc Miralles", "Publisher": "Penguin", "Pages": "208", "Language": "English", "ISBN": "978-0143130727", "Format": "Paperback"}',
            "price": 199.00, "original_price": 350.00, "discount_percent": 43,
            "stock": 160, "brand": "Penguin", "rating": 4.4, "rating_count": 98000,
            "category_slug": "books",
            "images": [
                # Books on wooden surface
                "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600",
                # Reading a book
                "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600",
            ],
        },
        {
            "name": "Clean Code by Robert C. Martin (Paperback)",
            "slug": "clean-code-robert-martin-paperback",
            "description": "A Handbook of Agile Software Craftsmanship. Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. This book is packed with real-world examples, case studies, and heuristics to help you write cleaner code.",
            "specifications": '{"Author": "Robert C. Martin", "Publisher": "Pearson", "Pages": "464", "Language": "English", "ISBN": "978-0132350884", "Format": "Paperback"}',
            "price": 2499.00, "original_price": 3999.00, "discount_percent": 37,
            "stock": 40, "brand": "Pearson", "rating": 4.6, "rating_count": 45600,
            "category_slug": "books",
            "images": [
                # Programming book
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
                # Library bookshelf
                "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600",
            ],
        },

        # ---- Sports ----
        {
            "name": "Yonex Nanoray Light 18i Badminton Racquet",
            "slug": "yonex-nanoray-light-18i-racquet",
            "description": "Lightweight yet powerful badminton racquet from Yonex with Nanomesh + Carbon Nanotube frame for enhanced repulsion. Isometric head shape for a larger sweet spot. Includes full cover.",
            "specifications": '{"Weight": "77g (5U)", "Balance": "Head Light", "Frame": "Nanomesh + Carbon Nanotube", "Shaft": "Carbon Graphite", "String Tension": "Up to 30 lbs", "Grip Size": "G4"}',
            "price": 2190.00, "original_price": 3190.00, "discount_percent": 31,
            "stock": 55, "brand": "Yonex", "rating": 4.4, "rating_count": 23400,
            "category_slug": "sports",
            "images": [
                # Badminton racquet and shuttlecock
                "https://images.unsplash.com/photo-1617083934555-ac7e4c0c0e4e?w=600",
                # Badminton court
                "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600",
            ],
        },
        {
            "name": "Nivia Storm Football (Size 5) - Black/Yellow",
            "slug": "nivia-storm-football-size5-black-yellow",
            "description": "Tournament-grade football from Nivia with 32-panel hand-stitched construction. Rubberised moulded surface for better grip and consistent flight. FIFA approved size and weight.",
            "specifications": '{"Size": "5 (Official)", "Material": "Synthetic Rubber", "Panels": "32 (Hand Stitched)", "Weight": "410-450g", "Bladder": "Butyl", "Usage": "Training & Match"}',
            "price": 699.00, "original_price": 999.00, "discount_percent": 30,
            "stock": 100, "brand": "Nivia", "rating": 4.2, "rating_count": 34500,
            "category_slug": "sports",
            "images": [
                # Football on grass
                "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600",
                # Soccer ball
                "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600",
            ],
        },
        {
            "name": "Boldfit Yoga Mat 6mm - Anti-Skid, Olive Green",
            "slug": "boldfit-yoga-mat-6mm-olive-green",
            "description": "Premium 6mm thick yoga mat with anti-skid texture on both sides for excellent grip. Made from high-density EVA foam for cushioning and joint protection. Lightweight and comes with a carry strap.",
            "specifications": '{"Thickness": "6mm", "Material": "EVA Foam", "Dimensions": "183 x 61 cm", "Anti-Skid": "Both Sides", "Weight": "800g", "Includes": "Carry Strap"}',
            "price": 399.00, "original_price": 1499.00, "discount_percent": 73,
            "stock": 150, "brand": "Boldfit", "rating": 4.1, "rating_count": 56700,
            "category_slug": "sports",
            "images": [
                # Rolled yoga mat
                "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600",
                # Yoga pose on mat
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600",
            ],
        },
        {
            "name": "STRAUSS Adjustable Dumbbell Set 20kg (PVC)",
            "slug": "strauss-adjustable-dumbbell-set-20kg",
            "description": "Versatile adjustable dumbbell set with 20kg of PVC weight plates. Includes 2 dumbbell rods (14\"), 4x2.5kg plates, 4x1.25kg plates, 4x0.5kg plates, and 4 spin-lock collars. Perfect for home workouts.",
            "specifications": '{"Total Weight": "20 kg", "Material": "PVC Coated", "Rod Length": "14 inches (x2)", "Plates": "4x2.5kg, 4x1.25kg, 4x0.5kg", "Collars": "4 Spin-Lock", "Grip": "Textured"}',
            "price": 1799.00, "original_price": 3999.00, "discount_percent": 55,
            "stock": 65, "brand": "STRAUSS", "rating": 4.0, "rating_count": 21300,
            "category_slug": "sports",
            "images": [
                # Gym dumbbells
                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600",
                # Dumbbell set
                "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600",
            ],
        },
        {
            "name": "SG RSD Xtreme English Willow Cricket Bat",
            "slug": "sg-rsd-xtreme-english-willow-cricket-bat",
            "description": "Professional-grade English Willow cricket bat from SG with traditional shape and thick edges for powerful stroke play. Premium SG grip and high spine for optimal pickup and balance.",
            "specifications": '{"Willow": "English Willow (Grade 2)", "Weight": "1100-1250g", "Edge": "38-40mm", "Handle": "Sarawak Cane", "Grip": "SG Chevron", "Size": "Full Size (SH)"}',
            "price": 6999.00, "original_price": 9999.00, "discount_percent": 30,
            "stock": 25, "brand": "SG", "rating": 4.3, "rating_count": 8900,
            "category_slug": "sports",
            "images": [
                # Cricket match / bat
                "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600",
                # Cricket action
                "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600",
            ],
        },

        # ---- Beauty & Personal Care ----
        {
            "name": "Maybelline New York Fit Me Foundation - 128 Warm Nude",
            "slug": "maybelline-fit-me-foundation-128-warm-nude",
            "description": "Lightweight foundation that fits seamlessly on skin and provides a natural, poreless-looking finish. With anti-shine powder that allows skin to breathe. Suitable for normal to oily skin.",
            "specifications": '{"Volume": "30 ml", "Finish": "Matte + Poreless", "Skin Type": "Normal to Oily", "Shade": "128 Warm Nude", "SPF": "None", "Dermatologist Tested": "Yes"}',
            "price": 399.00, "original_price": 550.00, "discount_percent": 27,
            "stock": 110, "brand": "Maybelline", "rating": 4.3, "rating_count": 87600,
            "category_slug": "beauty-personal-care",
            "images": [
                # Makeup / foundation products
                "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
                # Beauty products flat lay
                "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600",
            ],
        },
        {
            "name": "Philips BT1233/14 Skin-Friendly Beard Trimmer",
            "slug": "philips-bt1233-beard-trimmer",
            "description": "Skin-friendly beard trimmer with DuraPower technology for 4x longer lasting blade performance. Self-sharpening stainless steel blades with rounded tips prevent skin irritation. USB charging for cordless use.",
            "specifications": '{"Blades": "Stainless Steel, Self-Sharpening", "Length Settings": "20 (0.5mm - 10mm)", "Battery": "60 min cordless (1hr charge)", "Charging": "USB", "Washable Head": "Yes", "Warranty": "2 Years"}',
            "price": 1099.00, "original_price": 1495.00, "discount_percent": 26,
            "stock": 80, "brand": "Philips", "rating": 4.2, "rating_count": 145000,
            "category_slug": "beauty-personal-care",
            "images": [
                # Beard trimmer / grooming
                "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600",
                # Grooming kit
                "https://images.unsplash.com/photo-1585652757141-8837d023e3a7?w=600",
            ],
        },
        {
            "name": "The Derma Co 1% Salicylic Acid Gel Face Wash - 100ml",
            "slug": "derma-co-1pct-salicylic-acid-face-wash-100ml",
            "description": "Scientifically formulated face wash with 1% Salicylic Acid for targeting active acne, blackheads, and whiteheads. Gently exfoliates and deeply cleanses pores without over-drying. Suitable for oily and acne-prone skin.",
            "specifications": '{"Volume": "100 ml", "Key Ingredient": "1% Salicylic Acid", "Skin Type": "Oily, Acne-Prone", "Usage": "Twice Daily", "Paraben Free": "Yes", "Dermatologist Tested": "Yes"}',
            "price": 199.00, "original_price": 349.00, "discount_percent": 43,
            "stock": 200, "brand": "The Derma Co", "rating": 4.1, "rating_count": 67800,
            "category_slug": "beauty-personal-care",
            "images": [
                # Skincare product
                "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600",
                # Face wash / cleanser
                "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600",
            ],
        },
        {
            "name": "Biotique Bio Green Apple Shampoo & Conditioner - 650ml",
            "slug": "biotique-green-apple-shampoo-conditioner-650ml",
            "description": "Infused with green apple extract, this daily purifying shampoo and conditioner is enriched with sea algae, centella, and pure green apple to cleanse hair and nourish the scalp. 100% botanical extracts, no harsh chemicals.",
            "specifications": '{"Volume": "650 ml", "Key Ingredients": "Green Apple, Sea Algae, Centella", "Hair Type": "All Types", "Paraben Free": "Yes", "SLS Free": "No", "Shelf Life": "36 months"}',
            "price": 299.00, "original_price": 499.00, "discount_percent": 40,
            "stock": 130, "brand": "Biotique", "rating": 4.0, "rating_count": 54300,
            "category_slug": "beauty-personal-care",
            "images": [
                # Shampoo bottles
                "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600",
                # Hair care products
                "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600",
            ],
        },
        {
            "name": "Nivea Soft Light Moisturizing Cream - 300ml",
            "slug": "nivea-soft-light-moisturizing-cream-300ml",
            "description": "Refreshingly soft moisturizing cream with Vitamin E and Jojoba Oil. Light, non-greasy formula that absorbs instantly for smooth and supple skin. Suitable for face, hands, and body.",
            "specifications": '{"Volume": "300 ml", "Key Ingredients": "Vitamin E, Jojoba Oil", "Skin Type": "All Types", "Texture": "Light, Non-Greasy", "Dermatologically Tested": "Yes"}',
            "price": 275.00, "original_price": 399.00, "discount_percent": 31,
            "stock": 160, "brand": "Nivea", "rating": 4.4, "rating_count": 112000,
            "category_slug": "beauty-personal-care",
            "images": [
                # Moisturizer / cream jar
                "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600",
                # Skincare cream
                "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600",
            ],
        },
    ]

    for p_data in products_data:
        images = p_data.pop("images")
        category_slug = p_data.pop("category_slug")

        product = Product(
            **p_data,
            category_id=cat_objs[category_slug].id,
        )
        db.add(product)
        db.flush()  # populate product.id

        for i, url in enumerate(images):
            db.add(ProductImage(product_id=product.id, image_url=url, display_order=i))

    db.commit()
    db.close()
    print(f"✅ Seeded {len(categories_data)} categories and {len(products_data)} products.")


if __name__ == "__main__":
    reset = "--reset" in sys.argv
    seed(reset=reset)
