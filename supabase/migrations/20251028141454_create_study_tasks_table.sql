/*
  # Create Study Tasks Table

  1. New Tables
    - `study_tasks`
      - `id` (uuid, primary key) - Unique identifier
      - `title` (text, required) - Task title
      - `status` (text, default 'Da fare') - Task status (Da fare, Completato)
      - `created_date` (timestamptz, default now()) - Creation timestamp
      - `updated_date` (timestamptz, default now()) - Last update timestamp

  2. Security
    - Enable RLS on `study_tasks` table
    - Add policy for public read access
    - Add policy for authenticated users to insert/update/delete
*/

CREATE TABLE IF NOT EXISTS study_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text DEFAULT 'Da fare',
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now()
);

ALTER TABLE study_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read study_tasks"
  ON study_tasks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert study_tasks"
  ON study_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update study_tasks"
  ON study_tasks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete study_tasks"
  ON study_tasks
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_study_tasks_created_date ON study_tasks(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_study_tasks_status ON study_tasks(status);
