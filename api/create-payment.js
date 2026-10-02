// Trata requisições preflight (CORS) de outros sites
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  try {
    const apiKey = process.env.ZUMBOPAY_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ZUMBOPAY_API_KEY não configurada na Vercel." }),
        { status: 500, headers: corsHeaders }
      );
    }

    const body = await request.json();

    if (!body.amount || !body.customer?.phone) {
      return new Response(
        JSON.stringify({ error: "O valor (amount) e o telefone são obrigatórios." }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Chamada para a ZumboPay
    const response = await fetch("https://zumbopay.com/api/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        amount: Number(body.amount),
        currency: body.currency || "MZN",
        method: body.method || "mpesa",
        customer: {
          name: body.customer?.name || "Cliente",
          phone: body.customer?.phone,
        },
        callback_url: body.return_url || "https://viladriver.vercel.app/",
      }),
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: corsHeaders,
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Erro no servidor" }),
      { status: 500, headers: corsHeaders }
    );
  }
}
