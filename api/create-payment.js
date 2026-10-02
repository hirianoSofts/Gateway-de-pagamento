export async function POST(request) {
  try {
    const apiKey = process.env.ZUMBOPAY_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ZUMBOPAY_API_KEY não configurada nas variáveis de ambiente da Vercel." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();

    // Validação básica dos campos obrigatórios
    if (!body.amount || !body.customer?.phone) {
      return new Response(
        JSON.stringify({ error: "O valor (amount) e o número de telefone (phone) são obrigatórios." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("A enviar pedido para ZumboPay:", body);

    // Chamada à API ZumboPay
    const response = await fetch("https://zumbopay.com/api/v1/payments", {
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
          name: body.customer?.name || "Cliente Teste",
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
      data = { raw: text };
    }

    console.log("Resposta da ZumboPay:", response.status, data);

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Erro no Servidor:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
