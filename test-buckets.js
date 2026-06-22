import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://muipdomswcqajrpjtefp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aXBkb21zd2NxYWpycGp0ZWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5OTQxNDksImV4cCI6MjA5NzU3MDE0OX0.c--lf28DFfi4VSrRT1nesMvVLy4sHhYzF32O0cbjw9o';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Error listing buckets:', error);
    return;
  }
  console.log('Buckets:', data);
}

async function checkProductImages() {
  const { data, error } = await supabase.storage.getBucket('product-images');
  if (error) {
    console.error('Error getting bucket product-images:', error);
    return;
  }
  console.log('Bucket product-images:', data);
}

listBuckets().then(checkProductImages);