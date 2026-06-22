import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://muipdomswcqajrpjtefp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aXBkb21zd2NxYWpycGp0ZWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5OTQxNDksImV4cCI6MjA5NzU3MDE0OX0.c--lf28DFfi4VSrRT1nesMvVLy4sHhYzF32O0cbjw9o';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const { data: productos, error } = await supabase
    .from('productos')
    .select('*')
    .ilike('nombre', '%cerveza%');

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log('Found products:', productos);
  console.log('Total matches:', productos.length);
}

main();