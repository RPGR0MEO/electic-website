const stripe = require('stripe')('sk_test_51T8XZLBsXY2iNAlz1MMEnyUduuvqWY0lNmjg1hQS71bGYsw1aagEI6eBWRIpqbv03OaqKHGTH9bS3cixvzmFTr5B004zxf4TXl');

const MONTHLY_PRICE_ID   = 'price_1T8ZclBsXY2iNAlzNJWM4hLo';
const QUARTERLY_PRICE_ID = 'price_1T8ZdDBsXY2iNAlzcpsPoHpM';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method not allowed' };

  try {
    const { discordId, plan } = JSON.parse(event.body);

    if (!discordId || !/^\d{17,19}$/.test(discordId)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid Discord ID' }) };
    }

    const priceId = plan === 'quarterly' ? QUARTERLY_PRICE_ID : MONTHLY_PRICE_ID;
    const siteUrl = event.headers.referer || event.headers.origin || 'https://your-netlify-site.netlify.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${siteUrl}?success=true`,
      cancel_url: `${siteUrl}?cancelled=true`,
      metadata: { discord_id: discordId }
    });

    return { statusCode: 200, headers, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error('Checkout error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

