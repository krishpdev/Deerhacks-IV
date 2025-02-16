import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { Button } from "../components/ui/button";

interface ContentItem {
  content: string;
  objecttype: string;
  link?: string;
}

export default function HomePage() {
  const [url, setUrl] = useState("gemini://geminiprotocol.net/");
  const [result, setResult] = useState<ContentItem[]>([]);
  const [tabs, setTabs] = useState<string[]>(["gemini://geminiprotocol.net/"]);
  const [tabsptr, setTabsPtr] = useState(0);
  const [history, setHistory] = useState<string[]>([
    "gemini://geminiprotocol.net/",
  ]);
  const [historyptr, setHistoryPtr] = useState(0);

  // Load home page URL on first load
  useEffect(() => {
    handleSearch(url);
  }, []);

  const handleSearch = async (searchUrlToUse?: string) => {
    // Use the passed parameter if provided; otherwise, fall back to state
    const requestUrl = searchUrlToUse || url;

    console.log("Searching:", requestUrl);
    try {
      const response = await fetch("http://127.0.0.1:3333/geturl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: requestUrl }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const searchByUrl = async (searchUrl: string, index: number = tabsptr) => {
    setTabs((prevTabs) => {
      const newTabs = [...prevTabs];
      newTabs[index] = searchUrl;
      return newTabs;
    });
    setUrl(searchUrl);
    await handleSearch(searchUrl);
  };

  const searchByUrlAddHistory = async (searchUrl: string) => {
    setHistoryPtr(historyptr + 1);
    setHistory([...history, searchUrl]);
    searchByUrl(searchUrl);
  };

  const renderContent = (item: ContentItem) => {
    if (item === null) {
      return <Error404 />;
    }

    switch (item.objecttype) {
      case "header1":
        return <h1 className="text-2xl font-bold mt-4 mb-2">{item.content}</h1>;
      case "header2":
        return (
          <h2 className="text-xl font-semibold mt-3 mb-2">{item.content}</h2>
        );
      case "paragraph":
        return <p className="mb-2">{item.content}</p>;
      case "link":
        return (
          <Button
            onClick={() => searchByUrlAddHistory(item.link)}
            className="text-blue-500 hover:underline block mb-1"
          >
            {item.content}
          </Button>
        );
      default:
        return <p>{item.content}</p>;
    }
  };

  const Error404 = () => (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Oops! Page not found.</p>
      <Button 
        onClick={() => searchByUrlAddHistory('gemini://geminiprotocol.net/')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Go to Home
      </Button>
    </div>
  );

  return (
    <React.Fragment>
      <Head>
        <title>Gemini Browser</title>
      </Head>
      {/* Main Content */}
      <div className="w-full h-full">
        {/* Header Section */}
        <header>
          {/* Tabs */}
          <ul className="flex gap-2">
            {tabs.map((tab, index) => (
              <Button
                key={index}
                className={`inline p-2 w-48 h-10 bg-white rounded-lg shadow overflow-hidden whitespace-nowrap text-ellipsis ${
                  index === tabsptr ? "bg-blue-300" : "bg-gray-200"
                }`}
                onClick={() => {
                  setTabsPtr(index);
                  searchByUrl(tabs[index], index);
                }}
              >
                {tab}
              </Button>
            ))}
            <Button
              className="p-2 size-10 bg-white text-black rounded-lg shadow"
              onClick={() => {
                setTabsPtr(tabsptr + 1);
                setTabs([...tabs, "gemini://geminiprotocol.net/"]);
              }}
            >
              +
            </Button>
          </ul>

          {/* URL Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(url);
            }}
            className="flex"
          >
            <div className="flex gap-2">
              <Button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                onClick={() => {
                  if (historyptr > 0) setHistoryPtr(historyptr - 1);
                  searchByUrl(history[historyptr]);
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Search
              </Button>
              <Button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                onClick={() => {
                  if (historyptr < history.length - 1)
                    setHistoryPtr(historyptr + 1);
                  searchByUrl(history[historyptr]);
                }}
              >
                Forward
              </Button>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter Gemini URL"
              className="w-full px-4 text-gray-700 bg-white border rounded-lg focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
            />
          </form>

          {/* Favourites */}
          <ul className="text-center text-lg font-bold flex gap-2">
            <li>
              <Button
                className="bg-blue-500 text-white rounded-lg shadow"
                onClick={() =>
                  searchByUrlAddHistory("gemini://geminiprotocol.net/")
                }
              >
                Gemini Protocol
              </Button>
            </li>
            <li>
              <Button
                className="bg-blue-500 text-white rounded-lg shadow"
                onClick={() =>
                  searchByUrlAddHistory(
                    "gemini://geminiprotocol.net/docs/faq.gmi"
                  )
                }
              >
                Gemini FAQ
              </Button>
            </li>
            <li className="mb-2">
              <Button
                className="bg-blue-500 text-white rounded-lg shadow"
                onClick={() =>
                  searchByUrlAddHistory("gemini://gemi.dev/cgi-bin/wp.cgi/")
                }
              >
                Gemipedia
              </Button>
            </li>
            <li className="mb-2">
              <Button
                className="bg-blue-500 text-white rounded-lg shadow"
                onClick={() =>
                  searchByUrlAddHistory("gemini://cdg.thegonz.net/")
                }
              >
                TheGonz
              </Button>
            </li>
          </ul>
        </header>

        {/* Content Section */}
        <div className="bg-white min-h-screen p-6">
          {result === null ? (
            <Error404 />
          ) : (
            result.map((item, index) => (
              <React.Fragment key={index}>{renderContent(item)}</React.Fragment>
            ))
          )}
        </div>
      </div>
    </React.Fragment>
  );
}
