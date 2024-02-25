const rpc = `https://api.helius.xyz/?api-key=${process.env.HELIUS_KEY}`
const getAsset = async (token: string) => {
  const response = await fetch(rpc, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getAsset',
      params: {
        id: token
      },
    }),
  });
  const { result } = await response.json();
  return result;
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method === "POST") {
      const webhook: any = process.env.DISCORD_WEBHOOK;
      let webhook_data = req.body;
      let token: any = await getAsset(webhook_data[0].events.nft.nfts[0].mint);
      let solPrice = (await (await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')).json()).solana.usd;
      console.log('token', token);
      console.log('solPrice', solPrice);
      const response = await fetch(webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "content": null,
          "embeds": [
            {
              "title": token.content.metadata.name + " has sold!",
              "url": `https://solscan.io/token/${webhook_data[0].events.nft.nfts[0].mint}`,
              "color": 16486972,
              "fields": [
                {
                  "name": "\ ",
                  "value": "\ "
                },
                {
                  "name": "\ ",
                  "value": "\ "
                },
                {
                  "name": ":moneybag:  Sale Price",
                  "value": "**" + (webhook_data[0].events.nft.amount / 1000000000).toFixed(2) + " " + "SOL ($" + ((webhook_data[0].events.nft.amount / 1000000000) * solPrice).toFixed(2) + ")**",
                  "inline": true
                },
                {
                  "name": ":date:  Sale Date",
                  "value": `<t:${webhook_data[0].timestamp}:R>`,
                  "inline": true
                },
                {
                  "name": "\ ",
                  "value": "\ "
                },
                {
                  "name": "Buyer",
                  "value": webhook_data[0].events.nft.buyer.slice(0, 4) + '..' + webhook_data[0].events.nft.buyer.slice(-4),
                  "inline": true
                },
                {
                  "name": "Seller",
                  "value": webhook_data[0].events.nft.seller.slice(0, 4) + '..' + webhook_data[0].events.nft.seller.slice(-4),
                  "inline": true
                }
              ],
              "image": {
                "url": token.content.files[0].uri
              },
              timestamp: new Date().toISOString(),
              "footer": {
                "text": "Sujiko",
                "icon_url": "https://app.sujiko.trade/favicon.ico",
              }
            }
          ],

        },
        ),
      });
      res.status(200).json("success")
    };
  } catch (err) { 
    console.log(err)
  }
}