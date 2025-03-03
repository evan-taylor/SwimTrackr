-- -----------------------------------------------------
-- SwimTrackr Database Schema
-- -----------------------------------------------------

-- First, drop all existing tables (if they exist) to clean the slate
DROP TABLE IF EXISTS progress_notes CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS session_enrollments CASCADE;
DROP TABLE IF EXISTS swim_sessions CASCADE;
DROP TABLE IF EXISTS student_skills CASCADE;
DROP TABLE IF EXISTS skill_benchmarks CASCADE;
DROP TABLE IF EXISTS swim_levels CASCADE;
DROP TABLE IF EXISTS facilities_students CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;
DROP TABLE IF EXISTS facility_admins CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS admin_role;
DROP TYPE IF EXISTS enrollment_status;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS attendance_status;

-- Create custom types
CREATE TYPE admin_role AS ENUM ('owner', 'admin', 'instructor');
CREATE TYPE enrollment_status AS ENUM ('active', 'waitlisted', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('paid', 'unpaid', 'partial');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused', 'late');

-- -----------------------------------------------------
-- Create facilities table (swim schools)
-- -----------------------------------------------------
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------
-- Create facility_admins table (links users to facilities they can manage)
-- -----------------------------------------------------
CREATE TABLE facility_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(facility_id, user_id)
);

-- -----------------------------------------------------
-- Create instructors table
-- -----------------------------------------------------
CREATE TABLE instructors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bio TEXT,
  profile_image_url TEXT,
  certifications TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------
-- Create students table
-- -----------------------------------------------------
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  parent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_information TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------
-- Create facilities_students table (many-to-many relationship)
-- -----------------------------------------------------
CREATE TABLE facilities_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(facility_id, student_id)
);

-- -----------------------------------------------------
-- Create swim_levels table
-- -----------------------------------------------------
CREATE TABLE swim_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  min_age INTEGER,
  max_age INTEGER,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------
-- Create skill_benchmarks table
-- -----------------------------------------------------
CREATE TABLE skill_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  swim_level_id UUID REFERENCES swim_levels(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------
-- Create student_skills table (tracking achievements)
-- -----------------------------------------------------
CREATE TABLE student_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skill_benchmarks(id) ON DELETE CASCADE,
  achieved_date TIMESTAMPTZ DEFAULT now(),
  achieved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, skill_id)
);

-- -----------------------------------------------------
-- Create swim_sessions table
-- -----------------------------------------------------
CREATE TABLE swim_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  swim_level_id UUID REFERENCES swim_levels(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_of_week TEXT[] NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_students INTEGER NOT NULL,
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  location TEXT,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------
-- Create session_enrollments table
-- -----------------------------------------------------
CREATE TABLE session_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES swim_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMPTZ DEFAULT now(),
  status enrollment_status NOT NULL,
  payment_status payment_status,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- -----------------------------------------------------
-- Create attendance table
-- -----------------------------------------------------
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES session_enrollments(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  status attendance_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(enrollment_id, session_date)
);

-- -----------------------------------------------------
-- Create progress_notes table
-- -----------------------------------------------------
CREATE TABLE progress_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session_id UUID REFERENCES swim_sessions(id) ON DELETE SET NULL,
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  note_date DATE NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------
-- Row Level Security (RLS) Policies
-- -----------------------------------------------------

-- Enable Row Level Security on all tables
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE swim_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE swim_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_notes ENABLE ROW LEVEL SECURITY;

-- Facilities policies
CREATE POLICY "Facility admins can view their facilities"
  ON facilities FOR SELECT
  USING (
    id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can view their facilities"
  ON facilities FOR SELECT
  USING (
    id IN (
      SELECT facility_id FROM instructors
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view facilities their children are enrolled in"
  ON facilities FOR SELECT
  USING (
    id IN (
      SELECT facility_id FROM facilities_students
      WHERE student_id IN (
        SELECT id FROM students
        WHERE parent_id = auth.uid()
      )
    )
  );

CREATE POLICY "Facility owners and admins can insert facilities"
  ON facilities FOR INSERT
  WITH CHECK (TRUE);  -- Authenticated users can create facilities

CREATE POLICY "Facility owners and admins can update their facilities"
  ON facilities FOR UPDATE
  USING (
    id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Facility owners can delete their facilities"
  ON facilities FOR DELETE
  USING (
    id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Add similar policies for other tables
-- These are just examples, you'll want to define comprehensive policies for all tables

-- -----------------------------------------------------
-- Database Functions
-- -----------------------------------------------------

-- Function to get all students for a facility
CREATE OR REPLACE FUNCTION get_facility_students(facility_id UUID)
RETURNS SETOF students
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT s.* FROM students s
  JOIN facilities_students fs ON s.id = fs.student_id
  WHERE fs.facility_id = $1;
$$;

-- Function to get all sessions for a facility
CREATE OR REPLACE FUNCTION get_facility_sessions(facility_id UUID)
RETURNS SETOF swim_sessions
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM swim_sessions
  WHERE facility_id = $1;
$$;

-- Function to get all enrollments for a session
CREATE OR REPLACE FUNCTION get_session_enrollments(session_id UUID)
RETURNS TABLE(
  enrollment_id UUID,
  student_id UUID,
  student_first_name TEXT,
  student_last_name TEXT,
  enrollment_date TIMESTAMPTZ,
  status enrollment_status,
  payment_status payment_status
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    se.id AS enrollment_id,
    s.id AS student_id,
    s.first_name AS student_first_name,
    s.last_name AS student_last_name,
    se.enrollment_date,
    se.status,
    se.payment_status
  FROM session_enrollments se
  JOIN students s ON se.student_id = s.id
  WHERE se.session_id = $1;
$$;

-- -----------------------------------------------------
-- Triggers
-- -----------------------------------------------------

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create update timestamp triggers for all tables
CREATE TRIGGER update_facilities_timestamp
BEFORE UPDATE ON facilities
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_facility_admins_timestamp
BEFORE UPDATE ON facility_admins
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_instructors_timestamp
BEFORE UPDATE ON instructors
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_students_timestamp
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_swim_levels_timestamp
BEFORE UPDATE ON swim_levels
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_skill_benchmarks_timestamp
BEFORE UPDATE ON skill_benchmarks
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_student_skills_timestamp
BEFORE UPDATE ON student_skills
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_swim_sessions_timestamp
BEFORE UPDATE ON swim_sessions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_session_enrollments_timestamp
BEFORE UPDATE ON session_enrollments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_attendance_timestamp
BEFORE UPDATE ON attendance
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_progress_notes_timestamp
BEFORE UPDATE ON progress_notes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- -----------------------------------------------------
-- Default data for common swim levels and skills
-- -----------------------------------------------------

-- Insert default swim levels for independent parent tracking
INSERT INTO swim_levels (name, description, order_index)
VALUES
  ('Level 1 - Water Acclimation', 'Getting comfortable in the water, basic water safety', 1),
  ('Level 2 - Water Movement', 'Basic swimming movements, floating, and underwater exploration', 2),
  ('Level 3 - Water Stamina', 'Swimming longer distances, deep water activities', 3),
  ('Level 4 - Stroke Introduction', 'Introduction to basic strokes', 4),
  ('Level 5 - Stroke Development', 'Improving stroke technique and endurance', 5),
  ('Level 6 - Stroke Mechanics', 'Refining strokes and building endurance', 6);

-- Insert default skill benchmarks for independent parent tracking
INSERT INTO skill_benchmarks (name, description, category, swim_level_id, order_index)
SELECT 
  'Bubble Blowing', 
  'Child can blow bubbles with mouth in water', 
  'Water Comfort',
  id,
  1
FROM swim_levels WHERE name = 'Level 1 - Water Acclimation';

INSERT INTO skill_benchmarks (name, description, category, swim_level_id, order_index)
SELECT 
  'Face Submersion', 
  'Child can put entire face underwater', 
  'Water Comfort',
  id,
  2
FROM swim_levels WHERE name = 'Level 1 - Water Acclimation';

INSERT INTO skill_benchmarks (name, description, category, swim_level_id, order_index)
SELECT 
  'Front Float with Support', 
  'Child can float on front with assistance', 
  'Floating',
  id,
  3
FROM swim_levels WHERE name = 'Level 1 - Water Acclimation';

-- Add more default skills for different levels as needed 