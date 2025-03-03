import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Create Supabase client with service role key for full admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const setupDatabase = async () => {
  try {
    console.log('Starting database setup...');

    // Create facilities table (swim schools)
    console.log('Creating facilities table...');
    const { error: facilitiesError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'facilities',
      definition: `
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        address text,
        city text,
        state text,
        zip_code text,
        phone text,
        email text,
        website text,
        logo_url text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });

    if (facilitiesError) {
      console.error('Error creating facilities table:', facilitiesError.message);
    }

    // Create facility_admins table (links users to facilities they can manage)
    console.log('Creating facility_admins table...');
    const { error: facilityAdminsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'facility_admins',
      definition: `
        id uuid primary key default uuid_generate_v4(),
        facility_id uuid not null references facilities(id) on delete cascade,
        user_id uuid not null references auth.users(id) on delete cascade,
        role text not null check (role in ('owner', 'admin', 'instructor')),
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now(),
        unique(facility_id, user_id)
      `
    });

    if (facilityAdminsError) {
      console.error('Error creating facility_admins table:', facilityAdminsError.message);
    }

    // Create instructors table
    console.log('Creating instructors table...');
    const { error: instructorsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'instructors',
      definition: `
        id uuid primary key default uuid_generate_v4(),
        user_id uuid references auth.users(id) on delete set null,
        facility_id uuid not null references facilities(id) on delete cascade,
        first_name text not null,
        last_name text not null,
        email text,
        phone text,
        bio text,
        profile_image_url text,
        certifications text[],
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });

    if (instructorsError) {
      console.error('Error creating instructors table:', instructorsError.message);
    }

    // Create students table
    console.log('Creating students table...');
    const { error: studentsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'students',
      definition: `
        id uuid primary key default uuid_generate_v4(),
        first_name text not null,
        last_name text not null,
        date_of_birth date,
        parent_id uuid references auth.users(id) on delete set null,
        emergency_contact_name text,
        emergency_contact_phone text,
        medical_information text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });

    if (studentsError) {
      console.error('Error creating students table:', studentsError.message);
    }

    // Create facilities_students table (many-to-many relationship)
    console.log('Creating facilities_students table...');
    const { error: facilitiesStudentsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'facilities_students',
      definition: `
        id uuid primary key default uuid_generate_v4(),
        facility_id uuid not null references facilities(id) on delete cascade,
        student_id uuid not null references students(id) on delete cascade,
        created_at timestamp with time zone default now(),
        unique(facility_id, student_id)
      `
    });

    if (facilitiesStudentsError) {
      console.error('Error creating facilities_students table:', facilitiesStudentsError.message);
    }

    // Create swim_levels table
    console.log('Creating swim_levels table...');
    const { error: swimLevelsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'swim_levels',
      definition: `
        id uuid primary key default uuid_generate_v4(),
        facility_id uuid references facilities(id) on delete cascade,
        name text not null,
        description text,
        min_age integer,
        max_age integer,
        order_index integer not null,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });

    if (swimLevelsError) {
      console.error('Error creating swim_levels table:', swimLevelsError.message);
    }

    // Create skill_benchmarks table
    console.log('Creating skill_benchmarks table...');
    const { error: skillBenchmarksError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'skill_benchmarks',
      definition: `
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        description text,
        category text,
        facility_id uuid references facilities(id) on delete cascade,
        swim_level_id uuid references swim_levels(id) on delete set null,
        order_index integer not null,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });

    if (skillBenchmarksError) {
      console.error('Error creating skill_benchmarks table:', skillBenchmarksError.message);
    }

    // Create student_skills table (tracking achievements)
    console.log('Creating student_skills table...');
    const { error: studentSkillsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'student_skills',
      definition: `
        id uuid primary key default uuid_generate_v4(),
        student_id uuid not null references students(id) on delete cascade,
        skill_id uuid not null references skill_benchmarks(id) on delete cascade,
        achieved_date timestamp with time zone default now(),
        achieved_by uuid references auth.users(id) on delete set null,
        notes text,
        rating integer check (rating between 1 and 5),
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now(),
        unique(student_id, skill_id)
      `
    });

    if (studentSkillsError) {
      console.error('Error creating student_skills table:', studentSkillsError.message);
    }

    // Create swim_sessions table
    console.log('Creating swim_sessions table...');
    const { error: swimSessionsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'swim_sessions',
      definition: `
        id uuid primary key default uuid_generate_v4(),
        facility_id uuid not null references facilities(id) on delete cascade,
        name text not null,
        description text,
        swim_level_id uuid references swim_levels(id) on delete set null,
        start_date date not null,
        end_date date not null,
        days_of_week text[] not null,
        start_time time not null,
        end_time time not null,
        max_students integer not null,
        instructor_id uuid references instructors(id) on delete set null,
        location text,
        price decimal(10,2),
        is_active boolean default true,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });

    if (swimSessionsError) {
      console.error('Error creating swim_sessions table:', swimSessionsError.message);
    }

    // Create session_enrollments table
    console.log('Creating session_enrollments table...');
    const { error: sessionEnrollmentsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'session_enrollments',
      definition: `
        id uuid primary key default uuid_generate_v4(),
        session_id uuid not null references swim_sessions(id) on delete cascade,
        student_id uuid not null references students(id) on delete cascade,
        enrollment_date timestamp with time zone default now(),
        status text not null check (status in ('active', 'waitlisted', 'completed', 'cancelled')),
        payment_status text check (payment_status in ('paid', 'unpaid', 'partial')),
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now(),
        unique(session_id, student_id)
      `
    });

    if (sessionEnrollmentsError) {
      console.error('Error creating session_enrollments table:', sessionEnrollmentsError.message);
    }

    // Create attendance table
    console.log('Creating attendance table...');
    const { error: attendanceError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'attendance',
      definition: `
        id uuid primary key default uuid_generate_v4(),
        enrollment_id uuid not null references session_enrollments(id) on delete cascade,
        session_date date not null,
        status text not null check (status in ('present', 'absent', 'excused', 'late')),
        notes text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now(),
        unique(enrollment_id, session_date)
      `
    });

    if (attendanceError) {
      console.error('Error creating attendance table:', attendanceError.message);
    }

    // Create progress_notes table
    console.log('Creating progress_notes table...');
    const { error: progressNotesError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'progress_notes',
      definition: `
        id uuid primary key default uuid_generate_v4(),
        student_id uuid not null references students(id) on delete cascade,
        session_id uuid references swim_sessions(id) on delete set null,
        instructor_id uuid references instructors(id) on delete set null,
        note_date date not null,
        notes text not null,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    });

    if (progressNotesError) {
      console.error('Error creating progress_notes table:', progressNotesError.message);
    }

    // Set up RLS policies
    console.log('Setting up RLS policies...');
    
    // Enable RLS on all tables
    const tables = [
      'facilities', 'facility_admins', 'instructors', 'students', 
      'facilities_students', 'swim_levels', 'skill_benchmarks', 
      'student_skills', 'swim_sessions', 'session_enrollments', 
      'attendance', 'progress_notes'
    ];
    
    for (const table of tables) {
      const { error } = await supabase.rpc('enable_rls', { table_name: table });
      if (error) {
        console.error(`Error enabling RLS on ${table}:`, error.message);
      }
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

setupDatabase(); 