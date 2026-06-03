import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nhkpctbmyhjqsfozxdmb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oa3BjdGJteWhqcXNmb3p4ZG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDAzMzcsImV4cCI6MjA5NDYxNjMzN30.DzV-NsqO-KpqxdUldgj8OX-NPYWnHthPQ4bGi1ghGco';

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