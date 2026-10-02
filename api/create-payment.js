export default async function handler(req, res) {
  // Configuração dos Cabeçalhos CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  try {
    const apiKey = process.env.ZUMBOPAY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "ZUMBOPAY_API_KEY não configurada na Vercel." });
    }

    const body = req.body;

    if (!body || !body.amount || !body.customer?.phone) {
      return res.status(400).json({ error: "O valor (amount) e o número de telefone são obrigatórios." });
    }

    // Chamada à API ZumboPay
    const response = await fetch("https://zumbopay.com/api/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      body: JSON.stringify({
        amount: Number(body.amount),
        currency: body.currency || "MZN",
        method: body.method || "mpesa",
        customer: {
          name: body.customer?.name || "Cliente",
          phone: body.customer?.phone
        },
        callback_url: body.return_url || "https://viladriver.vercel.app/"
      })
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "A ZumboPay respondeu com HTML em vez de JSON.", raw: text };
    }

    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message || "Erro interno no servidor." });
  }
}
