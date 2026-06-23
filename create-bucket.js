import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createBucket() {
  const bucketName = 'kiro_images';

  console.log(`Intentando crear el bucket: ${bucketName}...`);

  const { data, error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    fileSizeLimit: 5242880 // 5MB
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log(`El bucket "${bucketName}" ya existe.`);
    } else {
      console.error('Error al crear el bucket:', error.message);
    }
  } else {
    console.log('Bucket creado con éxito:', data);
  }
}

createBucket();
