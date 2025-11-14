# Testing Guide: Inventory-Invoices Integration

## 🔍 What Was Fixed

### **The Problem**

The `product_id` was not being passed from the invoice form to the backend, so the system couldn't identify which products to deduct from inventory.

### **The Solution**

1. ✅ Added `product_id` to the invoice items when submitting the form
2. ✅ Added validation to ensure products are selected before submission
3. ✅ Added console logging for debugging
4. ✅ Improved error messages

---

## 🧪 Step-by-Step Testing Instructions

### **Step 1: Open Browser Console**

1. Open your app in the browser
2. Press `F12` or right-click → "Inspect"
3. Go to the "Console" tab
4. Keep this open during testing to see logs

### **Step 2: Check Your Current Inventory**

1. Navigate to **Inventory** page
2. Note down a product (e.g., "HP Laptop") and its quantity
3. Example:
   ```
   Product: HP Laptop
   Current Stock: 50 units
   Price: ₹45,000
   ```

### **Step 3: Create a Test Invoice**

1. Navigate to **Invoices** page
2. Click **"Create Invoice"** button

3. **Fill Customer Information:**

   - Customer Name: Test Customer
   - Email: test@example.com
   - Due Date: Select any future date

4. **Select Product:**

   - In the "Product" dropdown, select the product you noted earlier
   - The price should auto-fill
   - You should see: `HP Laptop - ₹45,000 (Stock: 50)`

5. **Enter Quantity:**

   - Enter: `5`
   - Make sure it's less than available stock

6. **Check Browser Console:**

   - You should see logs like:

   ```
   Creating invoice with data: {...}
   Checking inventory for product_id: xxx-xxx-xxx
   ✓ Stock check passed for HP Laptop: Available=50, Requested=5
   All inventory checks passed. Items to update: [...]
   Starting inventory updates...
   Updating HP Laptop: 50 - 5 = 45
   ✓ Successfully updated HP Laptop inventory to 45
   ✓ All inventory updates completed successfully
   ```

7. **Submit the Invoice:**
   - Click "Create Invoice"
   - You should see: "Invoice created successfully! Inventory has been updated."

### **Step 4: Verify Inventory Was Updated**

1. Navigate back to **Inventory** page
2. Find the product you just sold
3. **Expected Result:**
   ```
   Product: HP Laptop
   Current Stock: 45 units (was 50, sold 5)
   ```

### **Step 5: Check Activity Logs**

1. Navigate to **Activity Log** page (if available)
2. You should see entries like:
   - "Sold 5 units of HP Laptop via invoice INV-001"
   - "Created invoice INV-001 for Test Customer"

---

## ✅ Test Scenarios

### **Test 1: Normal Sale (Should Work)**

- Product: Any product with stock > 5
- Quantity to sell: 5
- **Expected:** ✅ Invoice created, inventory reduced by 5

### **Test 2: Insufficient Stock (Should Show Error)**

- Product: Any product with stock = 3
- Quantity to sell: 10
- **Expected:** ❌ Error message: "Insufficient stock for Product. Available: 3, Requested: 10"
- **Expected:** Inventory NOT changed

### **Test 3: No Product Selected (Should Show Error)**

- Leave product dropdown as "Select a product"
- Try to submit
- **Expected:** ❌ Error: "Please select a product for all items"

### **Test 4: Multiple Products (Should Work)**

- Add 3 different products to invoice
- Submit
- **Expected:** ✅ All 3 products' inventories are reduced

### **Test 5: Exact Stock Amount (Should Work)**

- Product with stock = 10
- Quantity to sell: 10
- **Expected:** ✅ Invoice created, inventory reduced to 0

---

## 🐛 Troubleshooting

### **If Inventory Is NOT Being Reduced:**

1. **Check Browser Console for Errors**

   - Look for red error messages
   - Look for the console.log messages we added
   - Share any errors you see

2. **Verify product_id is in console log**

   - When creating invoice, check console
   - Look for: `"product_id": "xxx-xxx-xxx"`
   - If it shows `"product_id": undefined`, the product wasn't selected properly

3. **Check Database Permissions**

   - Make sure your Supabase RLS policies allow updating products table
   - Check if user is authenticated

4. **Verify Migration Was Applied**
   - Go to Supabase Dashboard → Database → Tables
   - Click on `invoice_items` table
   - Verify `product_id` column exists

### **Common Issues:**

**Issue:** "Product_id is undefined"
**Solution:** Make sure you're selecting from the dropdown, not typing

**Issue:** "No rows returned" error
**Solution:** This is normal for ALTER TABLE - ignore it

**Issue:** Dropdown is empty
**Solution:** Make sure you have products in inventory first

**Issue:** Console logs not showing
**Solution:** Clear browser cache and refresh (Ctrl + Shift + R)

---

## 📊 What to Look For in Console

### **Successful Flow:**

```
Creating invoice with data: { items: [{ product_id: "xxx", ... }] }
Checking inventory for product_id: xxx-xxx-xxx
✓ Stock check passed for HP Laptop: Available=50, Requested=5
All inventory checks passed. Items to update: [...]
Starting inventory updates...
Updating HP Laptop: 50 - 5 = 45
✓ Successfully updated HP Laptop inventory to 45
✓ All inventory updates completed successfully
```

### **Failed Flow (Insufficient Stock):**

```
Creating invoice with data: { items: [{ product_id: "xxx", ... }] }
Checking inventory for product_id: xxx-xxx-xxx
Error: Insufficient stock for HP Laptop. Available: 3, Requested: 5
```

### **Failed Flow (Missing product_id):**

```
Creating invoice with data: { items: [{ product_id: undefined, ... }] }
All inventory checks passed. Items to update: []
(No inventory updates happen)
```

---

## 🎯 Success Criteria

Your integration is working correctly if:

- ✅ Products appear in dropdown with stock levels
- ✅ Price auto-fills when product is selected
- ✅ Console shows product_id in invoice data
- ✅ Console shows inventory update logs
- ✅ Inventory page shows reduced quantities
- ✅ Activity logs show the transactions
- ✅ Error message appears for insufficient stock
- ✅ Error message appears for no product selected

---

## 🔄 After Testing

Once you confirm everything works:

1. **Remove Console Logs (Optional):**

   - The console.log statements are helpful for debugging
   - You can leave them or remove them later

2. **Test in Production:**

   - Deploy to Netlify
   - Test with real data
   - Monitor for any issues

3. **Document for Team:**
   - Share this testing guide with your team
   - Train users on the new product dropdown feature

---

## 📝 Quick Checklist

Before reporting issues, please check:

- [ ] Migration was applied successfully
- [ ] Products exist in inventory
- [ ] Browser console is open
- [ ] Product is selected from dropdown (not empty)
- [ ] Quantity is less than available stock
- [ ] User is logged in
- [ ] Internet connection is stable

---

## 💬 Reporting Issues

If something doesn't work, provide:

1. **Browser console output** (screenshot or copy-paste)
2. **Steps you took** (be specific)
3. **Expected vs Actual result**
4. **Product details** (name, quantity before/after)
5. **Any error messages** shown to user

Example:

```
Steps:
1. Selected "HP Laptop" (Stock: 50)
2. Entered quantity: 5
3. Submitted invoice

Expected: Stock becomes 45
Actual: Stock remains 50

Console shows: [paste console output]
Error shown: None
```

---

## ✨ Additional Features Working

Along with inventory deduction, these features are also active:

- 🔍 Real-time stock display in dropdown
- 💰 Automatic price filling
- ⚠️ Low stock threshold alerts
- 📊 Activity logging
- 🚫 Oversell prevention
- ✅ Stock validation before submission

---

**Good luck with testing! 🚀**

If you follow these steps and still face issues, share the console output and I'll help you debug!
