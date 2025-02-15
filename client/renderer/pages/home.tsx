import React, { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'

export default function HomePage() {
  const [url, setUrl] = useState('gemini://geminiprotocol.net/')
  const [result, setResult] = useState('')

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const response = await fetch('http://127.0.0.1:3333/geturl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      const data = await response.text()
      setResult(data)
      console.log(data) // Print the result to the console
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return (
    <React.Fragment>
      <Head>
        <title>Gemini Browser</title>
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
        <span>Gemini Browser</span>
      </div>
      <form onSubmit={handleSearch} className="mt-8 w-full flex-wrap flex justify-center">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Gemini URL"
          className="w-full max-w-xl px-4 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
        />
        <button
          type="submit"
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Search
        </button>
      </form>
      {result && (
        <div className="mt-8 w-full flex-wrap flex justify-center">
          <pre className="text-left bg-gray-100 p-4 rounded-lg overflow-auto max-w-xl w-full">
            {result}
          </pre>
        </div>
      )}
    </React.Fragment>
  )
}
