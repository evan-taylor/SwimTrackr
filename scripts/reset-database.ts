import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Create Supabase client with service role key for full admin access
// ⚠️ Never expose this key in the browser or client-side code
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const reset = async () => {
  try {
    console.log('Starting database reset...');

    // Get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .not('table_name', 'ilike', 'pg_%')
      .not('table_name', 'ilike', 'auth.%');

    if (tablesError) {
      throw new Error(`Error fetching tables: ${tablesError.message}`);
    }

    console.log(`Found ${tables.length} tables to process`);

    // Drop RLS policies for each table
    for (const { table_name } of tables) {
      console.log(`Processing table: ${table_name}`);

      // Get existing policies
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_policies_for_table', { table_name: table_name });

      if (policiesError) {
        console.error(`Error fetching policies for ${table_name}: ${policiesError.message}`);
        continue;
      }

      // Drop each policy
      for (const policy of policies || []) {
        console.log(`Dropping policy: ${policy.policyname} from table ${table_name}`);
        const { error: dropPolicyError } = await supabase
          .rpc('drop_policy', { 
            p_table_name: table_name,
            p_policy_name: policy.policyname 
          });

        if (dropPolicyError) {
          console.error(`Error dropping policy ${policy.policyname}: ${dropPolicyError.message}`);
        }
      }

      // Truncate table data
      console.log(`Truncating table: ${table_name}`);
      const { error: truncateError } = await supabase
        .from(table_name)
        .delete()
        .neq('id', 0); // This will delete all rows

      if (truncateError) {
        console.error(`Error truncating ${table_name}: ${truncateError.message}`);
      }
    }

    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
};

reset(); 