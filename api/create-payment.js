export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Use POST."
    });
  }

  try {

    const apiKey = process.env.ZUMBOPAY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "ZUMBOPAY_API_KEY não configurada."
      });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    console.log("Pedido recebido:", body);

    const response = await fetch(
      "https://zumbopay.com/api/v1/payments",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },

        body: JSON.stringify({
          amount: Number(body.amount),

          currency: body.currency || "MZN",

          method: body.method || "mpesa",

          customer: {
            name: body.customer?.name || "",
            phone: body.customer?.phone || ""
          },

          callback_url:
            body.return_url ||
            "https://viladriver.vercel.app/"
        })
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

    console.log(
      "ZumboPay:",
      response.status,
      data
    );

    return res
      .status(response.status)
      .json(data);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
      }
