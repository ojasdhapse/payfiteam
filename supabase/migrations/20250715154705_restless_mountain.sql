@@ .. @@
 -- Add RLS policies for contributions
 CREATE POLICY "Anyone can read contributions"
   ON contributions
   FOR SELECT
   TO authenticated
   USING (true);
 
 CREATE POLICY "Users can create contributions"
   ON contributions
   FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() = contributor_id);
+
+-- Add database functions for updating campaign funding and user totals
+CREATE OR REPLACE FUNCTION increment_campaign_funding(campaign_id uuid, amount numeric)
+RETURNS void AS $$
+BEGIN
+  UPDATE campaigns 
+  SET current_funding = current_funding + amount,
+      updated_at = now()
+  WHERE id = campaign_id;
+END;
+$$ LANGUAGE plpgsql SECURITY DEFINER;
+
+CREATE OR REPLACE FUNCTION increment_total_donated(user_id uuid, amount numeric)
+RETURNS void AS $$
+BEGIN
+  UPDATE profiles 
+  SET total_donated = total_donated + amount,
+      updated_at = now()
+  WHERE id = user_id;
+END;
+$$ LANGUAGE plpgsql SECURITY DEFINER;
+
+-- Add columns for payout/refund tracking
+ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS payout_transaction_hash text;
+ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS refund_processed boolean DEFAULT false;