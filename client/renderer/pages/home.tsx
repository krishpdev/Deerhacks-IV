import React, { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Button } from "../components/ui/button"



interface ContentItem {
  content: string
  objecttype: string
  link?: string
}

export default function HomePage() {
  const [url, setUrl] = useState('gemini://geminiprotocol.net/')
  const [result, setResult] = useState<ContentItem[]>([])
  const [tabs, setTabs] = useState<string[]>(['gemini://geminiprotocol.net/'])

  const handleSearch = async (searchUrlToUse?: string) => {
    // Use the passed parameter if provided; otherwise, fall back to state
    const requestUrl = searchUrlToUse || url
    
    console.log("Searching:", requestUrl)
    try {
      const response = await fetch('http://127.0.0.1:3333/geturl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: requestUrl }),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  
  const searchByUrl = async (searchUrl: string) => {
    setUrl(searchUrl)
    await handleSearch(searchUrl)
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
        //console.log(item.link)
        return <Button onClick={() => searchByUrl(item.link)} className="text-blue-500 hover:underline block mb-1">{item.content}</Button>
      default:
        return <p>{item.content}</p>
    }
  }


  return (
    <React.Fragment>
      <Head>
        <title>Gemini Browser</title>
      </Head>
      <div className="container w-full mx-auto px-4 flex flex-row">
        {/* Sidebar */}
        <div className='w-1/6 container flex flex-col'>

          <div className="mt-[8rem] bg-blue-200 rounded-lg">
            <h2 className="text-center text-lg font-bold mb-4">Favorites</h2>
            <ul className="text-center text-lg font-bold mb-4">
              <li>
                <Button className="p-2 w-[90%] bg-blue-500 text-white rounded-lg shadow mb-2" onClick={() => searchByUrl("gemini://geminiprotocol.net/")}>
                  Gemini Protocol
                </Button>
              </li>
              <li>
                <Button className="p-2 w-[90%] bg-blue-500 text-white rounded-lg shadow mb-2" onClick={() => searchByUrl("gemini://geminiprotocol.net/docs/faq.gmi")}>
                  Gemini FAQ
                </Button>
              </li>
              <li className="mb-2">
                <Button className="p-2 w-[90%] bg-blue-500 text-white rounded-lg shadow mb-2" onClick={() => searchByUrl("gemini://geminiprotocol.net/community.gmi")}>
                  Gemini Community
                </Button>
              </li>
            </ul>
          </div>

          <div className="my-5 bg-gray-300 rounded-lg">
            <h2 className="text-center text-lg font-bold mb-4">Tabs</h2>
            <ul className="flex flex-col items-center justify-center">
              {tabs.map((tab, index) => (
                <li key={index} className="p-2 w-[90%] bg-white rounded-lg shadow mb-2">
                  {tab.length > 24 ? `${tab.substring(9, 24)}...` : tab}
                </li>
              ))}
            </ul>
          </div>

        </div>
        {/* Main Content */}
        <div className="w-full h-full ml-4">
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
                <Button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                
                </Button >
                <Button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Search
                </Button>
                <Button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                  
                </Button>
              </div>
            </form>
          </header>

          {/* Content Section */}
          <div className="bg-white min-h-[30rem] p-6 rounded-lg shadow-md">
            {result.map((item, index) => (
              <React.Fragment key={index}>
                {renderContent(item)}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}