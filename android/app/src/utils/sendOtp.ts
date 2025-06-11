import emailjs from 'emailjs-com';

export const sendOtp = async (
  email: string,
  otp: string,
  time?: string
): Promise<void> => {
  try {
    await emailjs.send(
  'service_jbqrza5',            // ✅ Service ID
  'template_jnn3ayd',           // ✅ Template ID
  {
    email: email,
    passcode: otp,
    time: time || new Date(Date.now() + 3 * 60000).toLocaleTimeString(),
  },
  'M_ge5jvUGi9DSg3AN'        // ✅ PRIVATE KEY
);

    console.log('✅ OTP sent to email');
  } catch (err) {
    console.error('❌ Failed to send OTP:', err);
    throw new Error('Gagal mengirim OTP. Coba lagi.');
  }
};
