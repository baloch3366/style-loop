import { Resend } from 'resend';
// console.log('🔧 Resend client initialized with key:', process.env.RESEND_API_KEY ? 'exists' : 'MISSING');

export const resend = new Resend(process.env.RESEND_API_KEY!);