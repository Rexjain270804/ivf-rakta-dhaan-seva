
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, fullName, relationPrefix, bloodGroup, registrationId } = await req.json()

    // Create HTML email template for certificate
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .certificate { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                padding: 40px; 
                border: 3px solid #1e40af; 
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { color: #1e40af; margin-bottom: 30px; }
            .title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 18px; color: #666; }
            .recipient { font-size: 24px; color: #dc2626; margin: 30px 0; }
            .message { font-size: 16px; line-height: 1.6; margin: 20px 0; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
            .blood-group { 
                display: inline-block; 
                background: #dc2626; 
                color: white; 
                padding: 5px 15px; 
                border-radius: 20px; 
                font-weight: bold; 
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="header">
                <div class="title">🩸 रक्तदान प्रमाणपत्र</div>
                <div class="title">Blood Donation Certificate</div>
                <div class="subtitle">अंतर्राष्ट्रीय वैश्य महासंघ / International Vaish Federation</div>
            </div>
            
            <div class="recipient">
                ${relationPrefix} ${fullName}
            </div>
            
            <div class="message">
                <p><strong>हार्दिक धन्यवाद! / Heartfelt Thanks!</strong></p>
                <p>आपने रक्तदान शिविर में पंजीकरण कराया है।<br>
                You have successfully registered for our Blood Donation Camp.</p>
                
                <p><strong>Blood Group:</strong> <span class="blood-group">${bloodGroup}</span></p>
                
                <p>आपका यह महान दान किसी की जिंदगी बचा सकता है।<br>
                Your noble donation can save someone's life.</p>
                
                <p><em>"सेवा ही धर्म है | Service is Religion"</em></p>
            </div>
            
            <div class="footer">
                <p><strong>Registration ID:</strong> ${registrationId}</p>
                <p>International Vaish Federation<br>
                Serving Humanity Through Blood Donation</p>
            </div>
        </div>
    </body>
    </html>
    `

    // For now, we'll log the email content since we don't have SMTP configured
    // In production, you would integrate with an email service like SendGrid, Resend, etc.
    console.log('Certificate email would be sent to:', email)
    console.log('Email content:', htmlTemplate)

    // You can integrate with email services here
    // Example with Resend:
    /*
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Blood Donation Camp <noreply@yourdomain.com>',
          to: [email],
          subject: 'Blood Donation Certificate - रक्तदान प्रमाणपत्र',
          html: htmlTemplate,
        }),
      })
      
      if (!emailResponse.ok) {
        throw new Error('Failed to send email')
      }
    }
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Certificate prepared successfully',
        registrationId 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
