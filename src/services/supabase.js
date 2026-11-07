import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload a document to Supabase Storage private bucket 'student-documents'
 * with fallback to 'submission-documents'.
 */
export async function uploadStudentDocument(file, collegeId, submissionId) {
  if (!supabase || !isSupabaseConfigured) {
    // Generate an in-memory/blob URL for full interactive testing when offline
    const objectUrl = URL.createObjectURL(file);
    return {
      success: true,
      file_name: file.name,
      file_url: objectUrl,
      file_size: file.size,
      file_type: file.type || 'application/pdf',
      storage_path: `offline/${submissionId}/${file.name}`
    };
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${collegeId}/${submissionId}/${Date.now()}_${cleanFileName}`;

  // Try 'student-documents' bucket first, fallback to 'submission-documents'
  let bucketName = 'student-documents';
  let { data, error } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error && (error.message?.includes('not found') || error.statusCode === '404')) {
    bucketName = 'submission-documents';
    const retry = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.warn('Supabase storage upload failed, using local URL:', error.message);
    const objectUrl = URL.createObjectURL(file);
    return {
      success: true,
      file_name: file.name,
      file_url: objectUrl,
      file_size: file.size,
      file_type: file.type || 'application/pdf',
      storage_path: storagePath,
      bucket: bucketName,
      warning: error.message
    };
  }

  // Generate signed URL for private bucket (valid for 2 hours)
  const { data: signedData } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(storagePath, 7200);

  return {
    success: true,
    file_name: file.name,
    file_url: signedData?.signedUrl || storagePath,
    file_size: file.size,
    file_type: file.type || 'application/pdf',
    storage_path: storagePath,
    bucket: bucketName
  };
}
