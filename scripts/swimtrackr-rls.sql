-- -----------------------------------------------------
-- SwimTrackr Row Level Security (RLS) Policies
-- -----------------------------------------------------

-- First, make sure RLS is enabled on all tables
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

-- -----------------------------------------------------
-- Facilities Policies
-- -----------------------------------------------------

-- Facility admins can view facilities they manage
CREATE POLICY "Facility admins can view their facilities"
  ON facilities FOR SELECT
  USING (
    id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid()
    )
  );

-- Instructors can view facilities they work for
CREATE POLICY "Instructors can view their facilities"
  ON facilities FOR SELECT
  USING (
    id IN (
      SELECT facility_id FROM instructors
      WHERE user_id = auth.uid()
    )
  );

-- Parents can view facilities their children are enrolled in
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

-- Anyone can create a facility
CREATE POLICY "Anyone can create a facility"
  ON facilities FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Facility owners and admins can update their facilities
CREATE POLICY "Facility owners and admins can update their facilities"
  ON facilities FOR UPDATE
  USING (
    id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Only facility owners can delete their facilities
CREATE POLICY "Facility owners can delete their facilities"
  ON facilities FOR DELETE
  USING (
    id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- -----------------------------------------------------
-- Facility Admins Policies
-- -----------------------------------------------------

-- Facility admins can view admin records for facilities they manage
CREATE POLICY "Facility admins can view admin records for their facilities"
  ON facility_admins FOR SELECT
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Facility owners can insert new admins
CREATE POLICY "Facility owners can insert new admins"
  ON facility_admins FOR INSERT
  WITH CHECK (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Facility owners can update admin records
CREATE POLICY "Facility owners can update admin records"
  ON facility_admins FOR UPDATE
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Facility owners can delete admin records
CREATE POLICY "Facility owners can delete admin records"
  ON facility_admins FOR DELETE
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Users can see their own admin records
CREATE POLICY "Users can see their own admin records"
  ON facility_admins FOR SELECT
  USING (user_id = auth.uid());

-- -----------------------------------------------------
-- Instructors Policies
-- -----------------------------------------------------

-- Facility admins can view instructors at their facilities
CREATE POLICY "Facility admins can view instructors at their facilities"
  ON instructors FOR SELECT
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid()
    )
  );

-- Instructors can view their own records
CREATE POLICY "Instructors can view their own records"
  ON instructors FOR SELECT
  USING (user_id = auth.uid());

-- Parents can view instructors for sessions their children are enrolled in
CREATE POLICY "Parents can view instructors for their children's sessions"
  ON instructors FOR SELECT
  USING (
    id IN (
      SELECT instructor_id FROM swim_sessions
      WHERE id IN (
        SELECT session_id FROM session_enrollments
        WHERE student_id IN (
          SELECT id FROM students
          WHERE parent_id = auth.uid()
        )
      )
    )
  );

-- Facility admins can insert instructors
CREATE POLICY "Facility admins can insert instructors"
  ON instructors FOR INSERT
  WITH CHECK (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Facility admins can update instructors
CREATE POLICY "Facility admins can update instructors"
  ON instructors FOR UPDATE
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Instructors can update their own info
CREATE POLICY "Instructors can update their own info"
  ON instructors FOR UPDATE
  USING (user_id = auth.uid());

-- Facility admins can delete instructors
CREATE POLICY "Facility admins can delete instructors"
  ON instructors FOR DELETE
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- -----------------------------------------------------
-- Students Policies
-- -----------------------------------------------------

-- Facility admins can view students at their facilities
CREATE POLICY "Facility admins can view students at their facilities"
  ON students FOR SELECT
  USING (
    id IN (
      SELECT student_id FROM facilities_students
      WHERE facility_id IN (
        SELECT facility_id FROM facility_admins
        WHERE user_id = auth.uid()
      )
    )
  );

-- Instructors can view students in their sessions
CREATE POLICY "Instructors can view students in their sessions"
  ON students FOR SELECT
  USING (
    id IN (
      SELECT student_id FROM session_enrollments
      WHERE session_id IN (
        SELECT id FROM swim_sessions
        WHERE instructor_id IN (
          SELECT id FROM instructors
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Parents can view their own children
CREATE POLICY "Parents can view their own children"
  ON students FOR SELECT
  USING (parent_id = auth.uid());

-- Parents can insert their own children
CREATE POLICY "Parents can insert their own children"
  ON students FOR INSERT
  WITH CHECK (parent_id = auth.uid());

-- Facility admins can insert students
CREATE POLICY "Facility admins can insert students"
  ON students FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM facility_admins
      WHERE role IN ('owner', 'admin')
    )
  );

-- Parents can update their own children
CREATE POLICY "Parents can update their own children"
  ON students FOR UPDATE
  USING (parent_id = auth.uid());

-- Facility admins can update students at their facilities
CREATE POLICY "Facility admins can update students at their facilities"
  ON students FOR UPDATE
  USING (
    id IN (
      SELECT student_id FROM facilities_students
      WHERE facility_id IN (
        SELECT facility_id FROM facility_admins
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Parents can delete their own children
CREATE POLICY "Parents can delete their own children"
  ON students FOR DELETE
  USING (parent_id = auth.uid());

-- Facility admins can delete students at their facilities
CREATE POLICY "Facility admins can delete students at their facilities"
  ON students FOR DELETE
  USING (
    id IN (
      SELECT student_id FROM facilities_students
      WHERE facility_id IN (
        SELECT facility_id FROM facility_admins
        WHERE user_id = auth.uid() AND role = 'owner'
      )
    )
  );

-- -----------------------------------------------------
-- Facilities Students Policies
-- -----------------------------------------------------

-- Facility admins can view facility-student relationships
CREATE POLICY "Facility admins can view facility-student relationships"
  ON facilities_students FOR SELECT
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid()
    )
  );

-- Parents can see which facilities their children are linked to
CREATE POLICY "Parents can see which facilities their children are linked to"
  ON facilities_students FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students
      WHERE parent_id = auth.uid()
    )
  );

-- Facility admins can link students to facilities
CREATE POLICY "Facility admins can link students to facilities"
  ON facilities_students FOR INSERT
  WITH CHECK (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Facility admins can unlink students from facilities
CREATE POLICY "Facility admins can unlink students from facilities"
  ON facilities_students FOR DELETE
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- -----------------------------------------------------
-- Swim Levels Policies
-- -----------------------------------------------------

-- Generic swim levels (facility_id is null) are visible to everyone
CREATE POLICY "Generic swim levels are visible to everyone"
  ON swim_levels FOR SELECT
  USING (facility_id IS NULL);

-- Facility-specific swim levels are visible to facility admins and instructors
CREATE POLICY "Facility-specific swim levels are visible to facility staff"
  ON swim_levels FOR SELECT
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid()
    ) OR
    facility_id IN (
      SELECT facility_id FROM instructors
      WHERE user_id = auth.uid()
    )
  );

-- Parents can see swim levels used in their children's sessions
CREATE POLICY "Parents can see swim levels used in their children's sessions"
  ON swim_levels FOR SELECT
  USING (
    id IN (
      SELECT swim_level_id FROM swim_sessions
      WHERE id IN (
        SELECT session_id FROM session_enrollments
        WHERE student_id IN (
          SELECT id FROM students
          WHERE parent_id = auth.uid()
        )
      )
    )
  );

-- Facility admins can create swim levels
CREATE POLICY "Facility admins can create swim levels"
  ON swim_levels FOR INSERT
  WITH CHECK (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ) OR 
    (facility_id IS NULL AND auth.uid() IN (
      SELECT user_id FROM facility_admins
      WHERE role = 'owner'
    ))
  );

-- Facility admins can update swim levels
CREATE POLICY "Facility admins can update swim levels"
  ON swim_levels FOR UPDATE
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ) OR 
    (facility_id IS NULL AND auth.uid() IN (
      SELECT user_id FROM facility_admins
      WHERE role = 'owner'
    ))
  );

-- Facility admins can delete swim levels
CREATE POLICY "Facility admins can delete swim levels"
  ON swim_levels FOR DELETE
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ) OR 
    (facility_id IS NULL AND auth.uid() IN (
      SELECT user_id FROM facility_admins
      WHERE role = 'owner'
    ))
  );

-- -----------------------------------------------------
-- Skill Benchmarks Policies
-- Follows similar pattern to swim levels
-- -----------------------------------------------------

-- Generic skills (facility_id is null) are visible to everyone
CREATE POLICY "Generic skills are visible to everyone"
  ON skill_benchmarks FOR SELECT
  USING (facility_id IS NULL);

-- Facility-specific skills are visible to facility staff
CREATE POLICY "Facility-specific skills are visible to facility staff"
  ON skill_benchmarks FOR SELECT
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid()
    ) OR
    facility_id IN (
      SELECT facility_id FROM instructors
      WHERE user_id = auth.uid()
    )
  );

-- Parents can see skills related to their children's achievements
CREATE POLICY "Parents can see skills related to their children's achievements"
  ON skill_benchmarks FOR SELECT
  USING (
    id IN (
      SELECT skill_id FROM student_skills
      WHERE student_id IN (
        SELECT id FROM students
        WHERE parent_id = auth.uid()
      )
    )
  );

-- Facility admins can create skills
CREATE POLICY "Facility admins can create skills"
  ON skill_benchmarks FOR INSERT
  WITH CHECK (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ) OR 
    (facility_id IS NULL AND auth.uid() IN (
      SELECT user_id FROM facility_admins
      WHERE role = 'owner'
    ))
  );

-- Similar policies for UPDATE and DELETE...

-- ... ADDITIONAL POLICIES FOR OTHER TABLES SHOULD BE ADDED HERE ...

-- -----------------------------------------------------
-- Example policies for some of the remaining tables
-- -----------------------------------------------------

-- Student Skills policies
CREATE POLICY "Parents can view their children's skills"
  ON student_skills FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students
      WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Facility staff can view skills for students at their facility"
  ON student_skills FOR SELECT
  USING (
    student_id IN (
      SELECT student_id FROM facilities_students
      WHERE facility_id IN (
        SELECT facility_id FROM facility_admins
        WHERE user_id = auth.uid()
      )
    ) OR
    student_id IN (
      SELECT student_id FROM session_enrollments
      WHERE session_id IN (
        SELECT id FROM swim_sessions
        WHERE instructor_id IN (
          SELECT id FROM instructors
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Swim Sessions policies
CREATE POLICY "Anyone can view active swim sessions"
  ON swim_sessions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Facility staff can view all sessions at their facility"
  ON swim_sessions FOR SELECT
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_admins
      WHERE user_id = auth.uid()
    ) OR
    facility_id IN (
      SELECT facility_id FROM instructors
      WHERE user_id = auth.uid()
    )
  );

-- ... AND SO ON FOR THE REMAINING TABLES ...

-- -----------------------------------------------------
-- Create a Supabase bucket for file storage if needed
-- -----------------------------------------------------
-- Note: This would typically be done through the Supabase dashboard
-- or using their API, not directly in SQL 