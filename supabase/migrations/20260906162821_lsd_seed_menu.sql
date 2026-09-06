/*
# LSD Restaurant — Seed Menu Items

Populates menu_items table with LSD-specific menu across all categories.
Prices are placeholder values the restaurant owner can edit from the admin panel.
Images sourced from Pexels (license-free food photography).
*/

DO $$
DECLARE
  c_burgers uuid;
  c_chicken uuid;
  c_wraps uuid;
  c_fries uuid;
  c_prawns uuid;
  c_combos uuid;
  c_drinks uuid;
  c_dips uuid;
BEGIN
  SELECT id INTO c_burgers FROM categories WHERE slug = 'burgers';
  SELECT id INTO c_chicken FROM categories WHERE slug = 'fried-chicken';
  SELECT id INTO c_wraps FROM categories WHERE slug = 'wraps';
  SELECT id INTO c_fries FROM categories WHERE slug = 'fries-sides';
  SELECT id INTO c_prawns FROM categories WHERE slug = 'prawns';
  SELECT id INTO c_combos FROM categories WHERE slug = 'combos';
  SELECT id INTO c_drinks FROM categories WHERE slug = 'drinks';
  SELECT id INTO c_dips FROM categories WHERE slug = 'dips';

  -- BURGERS
  INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, sort_order, customizations) VALUES
  (c_burgers, 'Veg Patty Burger', 'Crispy veg patty with fresh lettuce, tomato & house sauce', 99, 'https://images.pexels.com/photos/5639459/pexels-photo-5639459.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 1, '[]'),
  (c_burgers, 'Veg Blaze Burger', 'Spicy veg patty with jalapenos, cheese & blaze sauce', 119, 'https://images.pexels.com/photos/28396820/pexels-photo-28396820.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 2, '[]'),
  (c_burgers, 'Chicken Patty Burger', 'Juicy chicken patty with lettuce, tomato & mayo', 129, 'https://images.pexels.com/photos/8162589/pexels-photo-8162589.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 3, '[]'),
  (c_burgers, 'Chick Blaze Burger', 'Spicy chicken patty with jalapenos & blaze sauce', 149, 'https://images.pexels.com/photos/8305726/pexels-photo-8305726.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, true, true, 4, '[]'),
  (c_burgers, 'Crispy Chicken Burger', 'Crunchy fried chicken fillet with slaw & house sauce', 169, 'https://images.pexels.com/photos/17121731/pexels-photo-17121731.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, true, true, 5, '[]'),
  (c_burgers, 'Tandoori Chicken Cheese Burger', 'Tandoori-spiced chicken patty with melted cheese', 189, 'https://images.pexels.com/photos/5374420/pexels-photo-5374420.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 6, '[]'),
  (c_burgers, 'Mexican Chicken Cheese Burger', 'Mexican-spiced chicken patty with cheese & salsa', 189, 'https://images.pexels.com/photos/29481861/pexels-photo-29481861.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 7, '[]'),
  (c_burgers, 'All Cheese Chicken Burger', 'Double cheese, double chicken — cheese overload', 209, 'https://images.pexels.com/photos/18987002/pexels-photo-18987002.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, true, true, 8, '[]'),
  (c_burgers, 'Aloo Crunch', 'Crunchy aloo tikki patty with tangy chutney & onions', 89, 'https://images.pexels.com/photos/13833633/pexels-photo-13833633.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 9, '[]'),
  (c_burgers, 'Aloo Stack', 'Double aloo tikki with cheese, jalapenos & house sauce', 109, 'https://images.pexels.com/photos/13252530/pexels-photo-13252530.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 10, '[]'),
  (c_burgers, 'Paneer Blaze Burger', 'Spicy paneer patty with mint chutney & blaze sauce', 139, 'https://images.pexels.com/photos/31266291/pexels-photo-31266291.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 11, '[]');

  -- FRIED CHICKEN
  INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, sort_order, customizations) VALUES
  (c_chicken, 'Fried Chicken (2 pcs)', 'Classic crispy fried chicken, golden and juicy', 129, 'https://images.pexels.com/photos/5652257/pexels-photo-5652257.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, true, true, 1, '[]'),
  (c_chicken, 'Chicken Strips', '3 crispy chicken strips with your choice of dip', 149, 'https://images.pexels.com/photos/37228290/pexels-photo-37228290.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 2, '[]'),
  (c_chicken, 'Chicken Wings', '6 crispy wings tossed in peri peri sauce', 179, 'https://images.pexels.com/photos/8862763/pexels-photo-8862763.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, true, true, 3, '[]'),
  (c_chicken, 'Chicken Popcorn', 'Bite-sized crispy chicken popcorn, perfectly seasoned', 99, 'https://images.pexels.com/photos/8696558/pexels-photo-8696558.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 4, '[]'),
  (c_chicken, 'Drumsticks', '2 crispy fried chicken drumsticks, juicy inside', 119, 'https://images.pexels.com/photos/9872916/pexels-photo-9872916.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 5, '[]');

  -- WRAPS
  INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, sort_order, customizations) VALUES
  (c_wraps, 'Classic Chicken Wrap', 'Grilled chicken with lettuce, onions & house sauce', 129, 'https://images.pexels.com/photos/15913640/pexels-photo-15913640.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, true, true, 1, '[]'),
  (c_wraps, 'Tandoori Chicken Wrap', 'Tandoori chicken with mint chutney & onions in a soft wrap', 149, 'https://images.pexels.com/photos/5779364/pexels-photo-5779364.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 2, '[]'),
  (c_wraps, 'Cheesy Chicken Wrap', 'Chicken loaded with melted cheese & creamy sauce', 159, 'https://images.pexels.com/photos/16022887/pexels-photo-16022887.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 3, '[]'),
  (c_wraps, 'Falafel Wrap', 'Crispy falafel with hummus, veggies & tahini', 99, 'https://images.pexels.com/photos/9980749/pexels-photo-9980749.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 4, '[]'),
  (c_wraps, 'Chicken Falafel Wrap', 'Chicken & falafel combo with creamy sauce & veggies', 139, 'https://images.pexels.com/photos/18177330/pexels-photo-18177330.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 5, '[]'),
  (c_wraps, 'Veg Wrap', 'Fresh veggies with cheese & house sauce in a soft wrap', 89, 'https://images.pexels.com/photos/37322775/pexels-photo-37322775.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 6, '[]'),
  (c_wraps, 'Prawnzilla', 'Crispy prawns with spicy sauce & veggies in a wrap', 179, 'https://images.pexels.com/photos/17628583/pexels-photo-17628583.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 7, '[]');

  -- FRIES & SIDES
  INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, sort_order, customizations) VALUES
  (c_fries, 'Cheesy Fries', 'Crispy fries loaded with melted cheese', 99, 'https://images.pexels.com/photos/39034199/pexels-photo-39034199.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, true, true, 1, '[]'),
  (c_fries, 'Chicken Loaded Fries', 'Fries topped with chicken, cheese & sauces', 149, 'https://images.pexels.com/photos/15838896/pexels-photo-15838896.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, true, true, 2, '[]'),
  (c_fries, 'Peri Peri Fries', 'Crispy fries tossed in spicy peri peri seasoning', 79, 'https://images.pexels.com/photos/28992238/pexels-photo-28992238.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 3, '[]'),
  (c_fries, 'Salted Fries', 'Classic golden salted fries', 59, 'https://images.pexels.com/photos/12557545/pexels-photo-12557545.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 4, '[]');

  -- PRAWNS
  INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, sort_order, customizations) VALUES
  (c_prawns, 'Crispy Fried Prawns', 'Golden crispy fried prawns with dip', 199, 'https://images.pexels.com/photos/17628583/pexels-photo-17628583.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, true, true, 1, '[]'),
  (c_prawns, 'Prawn Tempura', 'Light crispy prawn tempura with creamy dip', 219, 'https://images.pexels.com/photos/16845598/pexels-photo-16845598.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 2, '[]'),
  (c_prawns, 'Peri Peri Prawns', 'Prawns tossed in spicy peri peri sauce', 229, 'https://images.pexels.com/photos/679454/pexels-photo-679454.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 3, '[]');

  -- COMBOS
  INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, sort_order, customizations) VALUES
  (c_combos, 'Mixed Chicken Bucket', '8 pcs mixed fried chicken — wings, strips & drumsticks', 399, 'https://images.pexels.com/photos/5474676/pexels-photo-5474676.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, true, true, 1, '[]'),
  (c_combos, 'Burger + Strips Combo', 'Any burger + 3 chicken strips + fries & drink', 249, 'https://images.pexels.com/photos/5488052/pexels-photo-5488052.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 2, '[]'),
  (c_combos, 'Burger + Wrap Combo', 'Any burger + any wrap + fries & drink', 269, 'https://images.pexels.com/photos/36879172/pexels-photo-36879172.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 3, '[]'),
  (c_combos, 'Burger + Popcorn Combo', 'Any burger + chicken popcorn + fries & drink', 229, 'https://images.pexels.com/photos/20532527/pexels-photo-20532527.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 4, '[]'),
  (c_combos, 'Value Bucket Meal', '12 pcs mixed chicken + fries + 2 drinks — great for sharing', 599, 'https://images.pexels.com/photos/27643007/pexels-photo-27643007.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, true, 5, '[]');

  -- DRINKS
  INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, sort_order, customizations) VALUES
  (c_drinks, 'Coca-Cola', 'Chilled 330ml can', 40, 'https://images.pexels.com/photos/4113632/pexels-photo-4113632.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 1, '[]'),
  (c_drinks, 'Coke Float', 'Coca-Cola with ice cream float', 60, 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 2, '[]'),
  (c_drinks, 'Iced Soda', 'Chilled soda with ice & lime', 30, 'https://images.pexels.com/photos/8880742/pexels-photo-8880742.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 3, '[]');

  -- DIPS
  INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, sort_order, customizations) VALUES
  (c_dips, 'Cheese Dip', 'Creamy melted cheese dip', 30, 'https://images.pexels.com/photos/16444399/pexels-photo-16444399.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 1, '[]'),
  (c_dips, 'Peri Peri Dip', 'Spicy peri peri mayo dip', 30, 'https://images.pexels.com/photos/6789880/pexels-photo-6789880.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 2, '[]'),
  (c_dips, 'Blaze Sauce Dip', 'House special spicy blaze sauce', 30, 'https://images.pexels.com/photos/39034206/pexels-photo-39034206.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, true, 3, '[]');
END $$;
