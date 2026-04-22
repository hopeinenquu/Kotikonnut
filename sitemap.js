// Netlify Function: Dynaaminen sitemap.xml
// Sijainti: netlify/functions/sitemap.js
//
// Tämä luo sitemapin automaattisesti hakemalla naapurustot Supabasesta.
// Päivittyy automaattisesti kun naapurustoja lisätään.
//
// Reititys hoidetaan _redirects-tiedostossa:
//   /sitemap.xml  /.netlify/functions/sitemap  200

const SB_URL = 'https://updyfjpkabpqhojpmihm.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZHlmanBrYWJwcWhvanBtaWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNzAzNTEsImV4cCI6MjA4OTY0NjM1MX0.byiG71T0TYlHG3w6xPKBo1Wz7s7Z2AwqttWu7NJBea0';
const SITE_URL = 'https://kortteliopas.fi';

exports.handler = async () => {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/neighborhoods?select=id,created_at`, {
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
    });
    const hoods = await res.json();

    const today = new Date().toISOString().slice(0, 10);
    const urls = [
      `<url><loc>${SITE_URL}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      ...hoods.map(h => {
        const lastmod = (h.created_at || '').slice(0, 10) || today;
        return `<url><loc>${SITE_URL}/${h.id}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
      })
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600' // 1h cache
      },
      body: xml
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Sitemap generation failed: ' + e.message
    };
  }
};
