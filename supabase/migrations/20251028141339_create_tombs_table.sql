/*
  # Create Tombs Table

  1. New Tables
    - `tombs`
      - `id` (uuid, primary key) - Unique identifier
      - `Numero_tomba` (text, required) - Main tomb number identifier
      - `altre_numerazioni` (jsonb) - Additional numbering systems (Klakowicz, Bizzarri, Scavo_Feruglio)
      - `Nome` (text) - Name from inscription
      - `has_epigraphy` (boolean, default false) - Whether tomb has inscriptions
      - `epigraphy_photo` (text) - URL to inscription photo
      - `epigraphy_transliteration` (text) - Inscription transliteration
      - `epigraphy_description` (text) - Inscription description
      - `epigraphy_cie_reference` (text) - CIE reference number
      - `epigraphy_bibliography` (text) - Inscription bibliography
      - `datazione` (text, default 'secondo quarto VI sec. a.C.') - Dating period
      - `localizzazione` (text) - Textual location description
      - `tipologia_tomba` (text, default 'tomba a camera') - Tomb typology
      - `sottotipo_copertura` (text) - Coverage subtype
      - `sottotipo_banchine` (text) - Bench subtype
      - `sottotipo_cassetta` (text) - Cassetta subtype
      - `dimensioni` (text) - Dimensions
      - `descrizione` (text) - Description
      - `appunti_di_scavo` (text) - Excavation notes
      - `bibliography_notes` (text) - Bibliography notes
      - `condizione_conservazione` (text, default 'Buona') - Conservation status
      - `tomb_photo` (text) - Tomb photo URL
      - `plan_photo` (text) - Plan photo URL
      - `excavation_photo` (text) - Excavation photo URL
      - `additional_images` (jsonb, default []) - Array of additional image URLs
      - `shape_coordinates` (jsonb, default []) - Map position coordinates
      - `created_date` (timestamptz, default now()) - Creation timestamp
      - `updated_date` (timestamptz, default now()) - Last update timestamp

  2. Security
    - Enable RLS on `tombs` table
    - Add policy for public read access (authenticated users)
    - Add policy for authenticated users to insert/update/delete
*/

CREATE TABLE IF NOT EXISTS tombs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "Numero_tomba" text NOT NULL,
  altre_numerazioni jsonb DEFAULT '{"Klakowicz": "", "Bizzarri": "", "Scavo_Feruglio": ""}'::jsonb,
  "Nome" text DEFAULT '',
  has_epigraphy boolean DEFAULT false,
  epigraphy_photo text DEFAULT '',
  epigraphy_transliteration text DEFAULT '',
  epigraphy_description text DEFAULT '',
  epigraphy_cie_reference text DEFAULT '',
  epigraphy_bibliography text DEFAULT '',
  datazione text DEFAULT 'secondo quarto VI sec. a.C.',
  localizzazione text DEFAULT '',
  tipologia_tomba text DEFAULT 'tomba a camera',
  sottotipo_copertura text DEFAULT '',
  sottotipo_banchine text DEFAULT '',
  sottotipo_cassetta text DEFAULT '',
  dimensioni text DEFAULT '',
  descrizione text DEFAULT '',
  appunti_di_scavo text DEFAULT '',
  bibliography_notes text DEFAULT '',
  condizione_conservazione text DEFAULT 'Buona',
  tomb_photo text DEFAULT '',
  plan_photo text DEFAULT '',
  excavation_photo text DEFAULT '',
  additional_images jsonb DEFAULT '[]'::jsonb,
  shape_coordinates jsonb DEFAULT '[]'::jsonb,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now()
);

ALTER TABLE tombs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tombs"
  ON tombs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert tombs"
  ON tombs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tombs"
  ON tombs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tombs"
  ON tombs
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tombs_numero ON tombs("Numero_tomba");
CREATE INDEX IF NOT EXISTS idx_tombs_created_date ON tombs(created_date DESC);
