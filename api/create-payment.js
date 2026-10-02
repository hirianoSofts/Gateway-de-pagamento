export async function POST(request) {
  try {
    const apiKey = process.env.ZUMBOPAY_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error: "ZUMBOPAY_API_KEY não configurada na Vercel."
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    console.log("Pedido recebido:", body);

    const response = await fetch(
      "https://zumbopay.com/api/v1/payments",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json"
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
      "Resposta ZumboPay:",
      response.status,
      data
    );

    return Response.json(data, {
      status: response.status
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: error.message
      },
      { status: 500 }
    );
  }
}
