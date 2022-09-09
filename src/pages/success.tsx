import { GetServerSideProps } from "next";
import Link from "next/link";
import Image from "next/future/image";
import { stripe } from "../lib/stripe";
import { ImageContainer, SuccessContainer } from "../styles/pages/success";
import Stripe from "stripe"

interface SuccessProps {
  costumerName: string;
  product: {
    name: string;
    images: string;
  }
}

export default function Success({ costumerName, product }: SuccessProps) {
  return (
    <SuccessContainer>
      <h1>Compra efetuada</h1>

      <ImageContainer>
        <Image src={product.images[0]} width={120} height={110} alt="" />
      </ImageContainer>

      <p>
        Uhuul <strong>{costumerName}</strong>, sua <strong>{product.name}</strong> já está a caminho da sua casa.
      </p>

      <Link href='/'>
        voltar ao catalogo
      </Link>
    </SuccessContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const sessionId = String(query.session_id)

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product']
  })

  // console.log(session)
  const costumerName = session?.customer_details?.name
  const product = session?.line_items?.data[0].price?.product as Stripe.Product
  // console.log(product.images)
  return {
    props: {
      costumerName,
      product

    }
  }
}