export const integrations = {
 gmail: { configured: Boolean(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET), scopes: ['gmail.readonly'] },
 github: { configured: Boolean(process.env.GITHUB_TOKEN), baseUrl: 'https://api.github.com' },
 wordpress: { configured: Boolean(process.env.WORDPRESS_BASE_URL), baseUrl: process.env.WORDPRESS_BASE_URL },
 plesk: { configured: Boolean(process.env.PLESK_BASE_URL && process.env.PLESK_API_KEY), baseUrl: process.env.PLESK_BASE_URL },
 stripe: { configured: Boolean(process.env.STRIPE_SECRET_KEY), baseUrl: 'https://api.stripe.com/v1' }
};
