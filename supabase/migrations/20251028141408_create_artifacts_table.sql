/*
  # Create Artifacts Table

  1. New Tables
    - `artifacts`
      - `id` (uuid, primary key) - Unique identifier
      - `inventory_number` (text, required) - Inventory number
      - `box_code` (text) - Box code
      - `tomb_id` (uuid) - Foreign key to tombs table
      - `excavation_campaign` (text, default 'Bizzarri-Binaco') - Excavation campaign
      - `stratigraphic_unit` (text) - US number
      - `dating` (text) - Dating period
      - `conservation_status` (jsonb, default []) - Array of conservation statuses
      - `object_type` (jsonb, default []) - Array of object types
      - `material` (text, default 'ceramica') - Material type
      - `class_type` (jsonb, default []) - Array of class types
      - `shape` (jsonb, default []) - Array of shapes
      - `dimensions` (jsonb) - Object dimensions (rim_diameter, base_diameter, rim_height, handle_height)
      - `excavation_data` (jsonb) - Excavation data (source, content)
      - `description` (text) - Detailed description
      - `artifact_images` (jsonb, default []) - Array of image URLs
      - `created_date` (timestamptz, default now()) - Creation timestamp
      - `updated_date` (timestamptz, default now()) - Last update timestamp

  2. Security
    - Enable RLS on `artifacts` table
    - Add policy for public read access
    - Add policy for authenticated users to insert/update/delete

  3. Relationships
    - Foreign key to tombs table
*/

CREATE TABLE IF NOT EXISTS artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_number text NOT NULL,
  box_code text DEFAULT '',
  tomb_id uuid REFERENCES tombs(id) ON DELETE SET NULL,
  excavation_campaign text DEFAULT 'Bizzarri-Binaco',
  stratigraphic_unit text DEFAULT '',
  dating text DEFAULT '',
  conservation_status jsonb DEFAULT '[]'::jsonb,
  object_type jsonb DEFAULT '[]'::jsonb,
  material text DEFAULT 'ceramica',
  class_type jsonb DEFAULT '[]'::jsonb,
  shape jsonb DEFAULT '[]'::jsonb,
  dimensions jsonb DEFAULT '{"rim_diameter": "", "base_diameter": "", "rim_height": "", "handle_height": ""}'::jsonb,
  excavation_data jsonb DEFAULT '{"source": "Cartellino allegato", "content": ""}'::jsonb,
  description text DEFAULT '',
  artifact_images jsonb DEFAULT '[]'::jsonb,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now()
);

ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read artifacts"
  ON artifacts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert artifacts"
  ON artifacts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update artifacts"
  ON artifacts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete artifacts"
  ON artifacts
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_artifacts_inventory ON artifacts(inventory_number);
CREATE INDEX IF NOT EXISTS idx_artifacts_tomb_id ON artifacts(tomb_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_created_date ON artifacts(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_artifacts_material ON artifacts(material);
