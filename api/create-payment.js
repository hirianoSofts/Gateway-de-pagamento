export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Só aceitamos POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Use POST neste endpoint."
    });
  }

  try {
    // API KEY fica SOMENTE na Vercel
    const apiKey = process.env.ZUMBOPAY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "ZUMBOPAY_API_KEY não configurada na Vercel."
      });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const {
      amount,
      currency = "MZN",
      method,
      customer,
      return_url
    } = body || {};

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: "amount é obrigatório."
      });
    }

    if (!customer?.phone) {
      return res.status(400).json({
        success: false,
        error: "customer.phone é obrigatório."
      });
    }

    const payment = {
      amount: Number(amount),
      currency,
      method: method || "mpesa",

      customer: {
        name: customer.name || "",
        phone: customer.phone
      },

      callback_url:
        return_url || "https://viladriver.vercel.app/"
    };

    console.log("Enviando pagamento para ZumboPay:", {
      ...payment
    });

    const response = await fetch(
      "https://zumbopay.com/api/v1/payments",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },

        body: JSON.stringify(payment)
      }
    );

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        raw: text
      };
    }

    console.log("Resposta ZumboPay:", response.status, data);

    return res.status(response.status).json(data);

  } catch (error) {

    console.error("Erro:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Erro interno."
    });
  }
    }
