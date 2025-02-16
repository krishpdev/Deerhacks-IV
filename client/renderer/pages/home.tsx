import React, { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'

interface ContentItem {
  content: string
  objecttype: string
  link?: string
}

export default function HomePage() {
  const [url, setUrl] = useState('gemini://geminiprotocol.net/')
  const [result, setResult] = useState<ContentItem[]>([])

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
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const renderContent = (item: ContentItem) => {
    switch (item.objecttype) {
      case 'header1':
        return <h1 className="text-2xl font-bold mt-4 mb-2">{item.content}</h1>
      case 'header2':
        return <h2 className="text-xl font-semibold mt-3 mb-2">{item.content}</h2>
      case 'paragraph':
        return <p className="mb-2">{item.content}</p>
      case 'link':
        return <a href={item.link} className="text-blue-500 hover:underline block mb-1">{item.content}</a>
      default:
        return <p>{item.content}</p>
    }
  }

  return (
    <React.Fragment>
      <Head>
        <title>Gemini Browser</title>
      </Head>
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <header className="mb-8">
          <div className="text-center mb-4">
            <Image
              className="mx-auto"
              src="/images/logo.png"
              alt="Logo image"
              width={128}
              height={128}
            />
            <h1 className="text-3xl font-bold mt-2">Gemini Browser</h1>
          </div>
          <form onSubmit={handleSearch} className="flex flex-col items-center">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter Gemini URL"
              className="w-full max-w-xl px-4 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 mb-2"
            />
            <div className="flex space-x-2">
              <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                Back
              </button>
              <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Search
              </button>
              <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                Forward
              </button>
            </div>
          </form>
        </header>

        {/* Content Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {result.map((item, index) => (
            <React.Fragment key={index}>
              {renderContent(item)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </React.Fragment>
  )
}