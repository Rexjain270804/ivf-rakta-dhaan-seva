import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, fullName, bloodGroup, registrationId } = await req.json();

    // Create HTML email template for certificate
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Blood Donation Certificate</title>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f5f5f5; }
        .certificate {
          width: 800px; height: 600px; background: url('https://i.ibb.co/Zz1Cks34/ivf-blood-donation-2.png') center/cover no-repeat;
          border: 4px solid #1e40af; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.15);
          position: relative; display: flex; flex-direction: column;
        }
        .name { position: absolute; top: 45%; left: 40%; transform: translate(-50%, -50%); font-size: 2.5rem; font-weight: bold; color: #1e40af; background: rgba(255, 255, 255, 0.8); padding: 15px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="name">${fullName}</div>
        <div class="details">
          <p><strong>Blood Group:</strong> <span class="blood-group">${bloodGroup}</span></p>
          <p><strong>Registration ID:</strong> ${registrationId}</p>
          <p>Thank you for your noble donation!</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Log the email content since we don't have SMTP configured
    console.log('Certificate email would be sent to:', email);
    console.log('Email content:', htmlTemplate);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Certificate prepared successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
