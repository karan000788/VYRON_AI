const WATI_BASE = process.env.WATI_API_ENDPOINT ?? 'https://live-server.wati.io';

export async function sendWATITemplate(params: {
  phone: string;
  templateName: string;
  parameters: { name: string; value: string }[];
}): Promise<Response> {
  const token = process.env.WATI_API_TOKEN;
  if (!token) throw new Error('WATI_API_TOKEN not configured');

  return fetch(`${WATI_BASE}/api/v1/sendTemplateMessage`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      whatsappNumber: params.phone.replace(/\D/g, ''),
      template_name: params.templateName,
      broadcast_name: 'vyron',
      parameters: params.parameters,
    }),
  });
}

export async function sendNightlySummary(
  phone: string,
  businessName: string,
  summary: string
) {
  return sendWATITemplate({
    phone,
    templateName: process.env.WATI_NIGHTLY_TEMPLATE ?? 'nightly_summary',
    parameters: [
      { name: 'business', value: businessName },
      { name: 'summary', value: summary.slice(0, 500) },
    ],
  });
}
