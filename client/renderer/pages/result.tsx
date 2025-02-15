import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'

export default function ResultPage() {
  const router = useRouter()
  const { joke } = router.query

  return (
    <React.Fragment>
      <Head>
        <title>Result - Joke Generator</title>
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
        <span>Here's Your Joke:</span>
      </div>
      <div className="mt-8 w-full flex-wrap flex justify-center">
        <p className="text-xl mb-8 px-4 text-center">{joke}</p>
      </div>
      <div className="mt-8 w-full flex-wrap flex justify-center">
        <Link href="/home" legacyBehavior>
          <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Back to Home
          </a>
        </Link>
      </div>
    </React.Fragment>
  )
}
