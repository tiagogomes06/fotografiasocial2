import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    console.log('Starting upload process...');
    
    let file;
    let fileName;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const { fileData, fileName: providedFileName } = await req.json();
      if (!fileData || !providedFileName) {
        throw new Error('Missing required data: fileData or fileName');
      }
      fileName = providedFileName;
      
      // Convert base64 to blob
      const base64Data = fileData.split(',')[1];
      const byteString = atob(base64Data);
      const byteArray = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }
      file = new Blob([byteArray]);
    } else {
      const formData = await req.formData();
      file = formData.get('file');
      if (!file || !(file instanceof File)) {
        throw new Error('Missing or invalid file');
      }
      fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
    }

    console.log('Generated filename:', fileName);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        contentType: file instanceof File ? file.type : 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded to Supabase, getting public URL...');
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    console.log('Generated public URL:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in upload process:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});