import { stripe } from '../../lib/stripe';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const priceId = 'price_1LfmzPImdh0rSCK7S8mqWrPD'

  const succsessUrl = `${process.env.NEXT_URL}/success`
  const cancelUrl = `${process.env.NEXT_URL}`

  const checkoutSession = await stripe.checkout.sessions.create({
    success_url: succsessUrl,
    cancel_url: cancelUrl,
    mode: 'payment',
    line_items: [
      {
        price: priceId,
        quantity: 1,

      }
    ],
  })

  return res.status(201).json({
    checkoutUrl: checkoutSession.url
  })
}