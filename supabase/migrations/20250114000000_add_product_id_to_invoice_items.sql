-- Add product_id column to invoice_items table
ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);
