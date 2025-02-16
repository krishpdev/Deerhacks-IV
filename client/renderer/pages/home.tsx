import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://api.chucknorris.io/jokes/random')
      const data = await response.json()
      router.push({
        pathname: '/result',
        query: { joke: data.value },
      })
    } catch (error) {
      console.error('Error fetching joke:', error)
      setLoading(false)
    }
  }

  return (
    <React.Fragment>
      <Head>
        <title>Home - Joke Generator</title>
      </Head>
      <div className="grid grid-col-1 text-2xl w-full text-center">
        <div>
          <Image
            className="ml-auto mr-auto"
            src="/images/logo.png"
            alt="Logo image"
            width={256}
            height={256}
          />
        </div>
        <span>Welcome to Joke Generator</span>
      </div>
      <div className="mt-8 w-full flex-wrap flex justify-center">
        <button
          onClick={handleClick}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {loading ? 'Loading...' : 'Get a Random Joke'}
        </button>
      </div>
    </React.Fragment>
  )
}