# ZumboPay + GitHub + Vercel

O frontend (`index.html`, `style.css`, `script.js`) pode ficar no GitHub Pages ou ser aberto em localhost. O backend está em `api/create-payment.js` e é executado pela Vercel.

## Vercel
1. Importe o repositório.
2. Em Settings > Environment Variables crie `ZUMBOPAY_API_KEY` com a sua chave. Use Secret para a chave.
3. Faça redeploy.
4. Copie a URL da Vercel.
5. Em `script.js`, substitua `https://SEU-PROJETO.vercel.app/api/create-payment` pela URL real.

A API key nunca vai para o frontend.

A ZumboPay documenta `POST https://zumbopay.com/api/v1/payments`, Authorization Bearer e uma resposta contendo `checkout_url`.

## GitHub Pages
Publique apenas os três ficheiros do frontend. O frontend chama a Function da Vercel, por isso não precisa da API key.

## Importante
A chave live anteriormente colocada no JavaScript ficou exposta. Gere uma nova antes de produção.

Este exemplo cria o pagamento e abre o checkout. Para a VilaTáxi, a confirmação de pagamento e crédito do saldo devem ser feitas por webhook/backend, não pelo retorno do navegador.
