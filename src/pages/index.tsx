import { useKeenSlider } from 'keen-slider/react'
import Image from 'next/future/image'
import { HomeContainer, Product, SliderContainer } from '../styles/pages/home'

import 'keen-slider/keen-slider.min.css'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { Handbag } from 'phosphor-react'
import { useState } from 'react'
import { Stripe } from 'stripe'
import { formatCurrencyString, useShoppingCart } from 'use-shopping-cart'
import { stripe } from '../lib/stripe'
import { CartButton } from '../styles/components/header'

type ProductType = {
  name: string
  id: string
  imageUrl: string
  price: string
  description: string
  priceNotFormatted: number
  priceId: string
}

interface HomeProps {
  products: ProductType[]
}

export default function Home({ products }: HomeProps) {
  const { addItem, cartDetails } = useShoppingCart()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [sliderRef, instanceRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    },

    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    created() {
      setLoaded(true)
    },
  })

  function handleAddItemToCart(product: ProductType) {
    if (cartDetails[product.id]) return () => { }
    return () => {
      addItem({
        currency: 'BRL',
        id: product.id,
        name: product.name,
        price: product.priceNotFormatted,
        price_id: product.priceId,
        image: product.imageUrl,
        description: product.description,
      })
    }
  }

  return (
    <>
      <Head>
        <title>Home | Ignite Shop</title>
      </Head>

      <SliderContainer>
        <HomeContainer ref={sliderRef} className="keen-slider">
          {products.map((product) => (
            <Product key={product.id} className="keen-slider__slide">
              <Link href={`/product/${product.id}`} passHref prefetch={false}>
                <Image src={product.imageUrl} width={520} height={480} alt="" />
              </Link>

              <footer>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </div>
                <CartButton
                  onClick={handleAddItemToCart(product)}
                  color="green"
                >
                  <Handbag size={24} />
                </CartButton>
              </footer>
            </Product>
          ))}
        </HomeContainer>
      </SliderContainer>
    </>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
  })

  const products = response.data.map((product) => {
    const price = product.default_price as Stripe.Price

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0] ?? '',
      price: formatCurrencyString({
        currency: 'BRL',
        value: price.unit_amount,
        language: 'pt-BR',
      }),
      priceId: price.id,
      description: product.description,
      priceNotFormatted: price.unit_amount,
    }
  })

  return {
    props: {
      products,
    },
    revalidate: 60 * 60 * 10,
  }
}
