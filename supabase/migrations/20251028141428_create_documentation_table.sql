/*
  # Create Documentation Table

  1. New Tables
    - `documentation`
      - `id` (uuid, primary key) - Unique identifier
      - `title` (text, required) - Document title
      - `document_type` (text, default 'Relazione di scavo') - Type of document
      - `author` (text) - Document author
      - `date` (date) - Document date
      - `description` (text) - Brief description
      - `content` (text) - Full document content
      - `tomb_associations` (jsonb, default []) - Array of associated tomb IDs
      - `artifact_associations` (jsonb, default []) - Array of associated artifact IDs
      - `tags` (jsonb, default []) - Array of tags
      - `bibliography` (text) - Related bibliography
      - `document_files` (jsonb, default []) - Array of file URLs
      - `priority` (text, default 'Media') - Priority level
      - `created_date` (timestamptz, default now()) - Creation timestamp
      - `updated_date` (timestamptz, default now()) - Last update timestamp

  2. Security
    - Enable RLS on `documentation` table
    - Add policy for public read access
    - Add policy for authenticated users to insert/update/delete
*/

CREATE TABLE IF NOT EXISTS documentation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  document_type text DEFAULT 'Relazione di scavo',
  author text DEFAULT '',
  date date,
  description text DEFAULT '',
  content text DEFAULT '',
  tomb_associations jsonb DEFAULT '[]'::jsonb,
  artifact_associations jsonb DEFAULT '[]'::jsonb,
  tags jsonb DEFAULT '[]'::jsonb,
  bibliography text DEFAULT '',
  document_files jsonb DEFAULT '[]'::jsonb,
  priority text DEFAULT 'Media',
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now()
);

ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read documentation"
  ON documentation
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert documentation"
  ON documentation
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update documentation"
  ON documentation
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete documentation"
  ON documentation
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_documentation_title ON documentation(title);
CREATE INDEX IF NOT EXISTS idx_documentation_created_date ON documentation(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_documentation_priority ON documentation(priority);
