import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'contact' | 'chatbot';
  name: string;
  email: string;
  phone?: string;
  location?: string;
  service?: string;
  message?: string;
  chatTranscript?: string;
}

// Basic HTML escaping to prevent injection in emails
const escapeHTML = (str: string = "") =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sanitizeAndValidate = (data: EmailRequest): EmailRequest => {
  const name = escapeHTML((data.name || "").trim());
  const email = (data.email || "").trim().toLowerCase();
  const phone = (data.phone || "").replace(/\D/g, "");
  const message = escapeHTML((data.message || "").trim());
  const location = escapeHTML((data.location || "").trim());
  const service = escapeHTML((data.service || "").trim());
  const chatTranscript = escapeHTML((data.chatTranscript || "").trim());
  const type = data.type === 'chatbot' ? 'chatbot' : 'contact';

  if (!name || name.length > 100) throw new Error('Invalid name');
  if (!isValidEmail(email) || email.length > 255) throw new Error('Invalid email');
  if (type === 'contact') {
    if (!phone || phone.length < 7 || phone.length > 15) throw new Error('Invalid phone');
    if (!message || message.length > 1000) throw new Error('Invalid message');
  }

  return { type, name, email, phone, location, service, message, chatTranscript } as EmailRequest;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData: EmailRequest = await req.json();
    const emailData = sanitizeAndValidate(rawData);
    console.log('Received email request:', emailData);
    // Company email to receive contact form submissions
    const companyEmail = 'shreeinteriorschatbot@gmail.com';

    // Prepare email content
    const subject = "New Contact Form Submission - Shree Interiors";
    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${emailData.name}</p>
      <p><strong>Email:</strong> ${emailData.email}</p>
      <p><strong>Phone:</strong> ${emailData.phone || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <p>${emailData.message || 'No message provided'}</p>
      <hr>
      <p><em>Submitted at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</em></p>
    `;

    // Send email to company using Resend
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: 'Shree Interiors <onboarding@resend.dev>',
      to: [companyEmail],
      subject,
      html: htmlContent,
      replyTo: emailData.email,
    });

    if (resendError) {
      console.error('Resend send error:', resendError);
      return new Response(
        JSON.stringify({
          success: false,
          error: resendError.message || 'Email provider error',
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    console.log('Email sent successfully:', resendData);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email' 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
