import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { X, ArrowLeft, ArrowRight, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [history, setHistory] = useState<string[]>(["gemini://geminiprotocol.net/"]);
  const [historyptr, setHistoryPtr] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredTabIndex, setHoveredTabIndex] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const containerRef = useRef(null);

  const handleMouseMove = (event) => {
    if (hoveredTabIndex !== null && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const x = event.clientX - container.left;
      const y = event.clientY - container.top;

      if (container.width - x < 170) {
        setTooltipStyle({
          left: `${container.width - 170}px`,
          top: `${container.height}px`,
        });
      } else {
        setTooltipStyle({
          left: `${x}px`,
          top: `${y + 20}px`,
        });
      }
    }
  };

  useEffect(() => {
    handleSearch(url);
  }, []);

  const handleSearch = async (searchUrlToUse?: string) => {
    const requestUrl = searchUrlToUse || url;
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

  const closeTab = (indexToClose: number) => {
    if (tabs.length > 1) {
      setTabs(tabs.filter((_, index) => index !== indexToClose));
      if (tabsptr >= indexToClose) {
        setTabsPtr(Math.max(0, tabsptr - 1));
      }
      if (tabsptr === indexToClose) {
        searchByUrl(tabs[Math.max(0, tabsptr - 1)], Math.max(0, tabsptr - 1));
      }
    }
  };

  const renderContent = (item: ContentItem) => {
    if (item === null) {
      return <Error404 />;
    }

    switch (item.objecttype) {
      case "header1":
        return <h1 className="text-2xl font-bold mt-4 mb-2">{item.content}</h1>;
      case "header2":
        return <h2 className="text-xl font-semibold mt-3 mb-2">{item.content}</h2>;
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
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Oops! Page not found.</p>
      <Button 
        onClick={() => searchByUrlAddHistory('gemini://geminiprotocol.net/')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Go to Home
      </Button>
    </div>
  );

  const LoadingBar = () => (
    <div className="fixed top-0 left-0 w-full h-1 bg-blue-200">
      <div className="h-full bg-blue-500 animate-pulse" style={{width: '100%'}}></div>
    </div>
  );

  return (
    <React.Fragment>
      <Head>
        <title>Gemini Browser</title>
      </Head>
      <div className="w-full min-h-screen bg-gray-900 text-white">
        {isLoading && <LoadingBar />}
        <header className="p-4 space-y-4 bg-black">
          <div className="relative" onMouseMove={handleMouseMove} ref={containerRef}>
            <div className="flex space-x-2 overflow-x-auto">
              {tabs.map((tab, index) => (
                <div
                  key={index}
                  className="relative group"
                  onMouseEnter={() => setHoveredTabIndex(index)}
                  onMouseLeave={() => setHoveredTabIndex(null)}
                >
                  <Button
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md pr-8",
                      index === tabsptr
                        ? "bg-blue-900 text-white"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    )}
                    onClick={() => {
                      setTabsPtr(index);
                      searchByUrl(tabs[index], index);
                    }}
                  >
                    {tab.length > 20 ? tab.substring(0, 20) + "..." : tab}
                  </Button>
                  <button
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(index);
                    }}
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-white" />
                  </button>
                </div>
              ))}
              <Button
                className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                onClick={() => {
                  setTabsPtr(tabs.length);
                  setTabs([...tabs, "gemini://geminiprotocol.net/"]);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {hoveredTabIndex !== null && tabs[hoveredTabIndex] && (
              <div 
                className="absolute px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-md z-10 whitespace-nowrap"
                style={tooltipStyle}
              >
                {tabs[hoveredTabIndex]}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(url);
            }}
            className="flex space-x-2"
          >
            <Button
              type="button"
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 h-10"
              onClick={() => {
                if (historyptr > 0) setHistoryPtr(historyptr - 1);
                searchByUrl(history[historyptr]);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 h-10"
              onClick={() => {
                if (historyptr < history.length - 1) setHistoryPtr(historyptr + 1);
                searchByUrl(history[historyptr]);
              }}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter Gemini URL"
              className="flex-grow px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10"
            />
            <Button type="submit" className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 h-10">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex space-x-2 overflow-x-auto">
            <Button className="bg-gray-800 text-white rounded-md hover:bg-gray-700" onClick={() => searchByUrlAddHistory("gemini://geminiprotocol.net/")}>
              Gemini Protocol
            </Button>
            <Button className="bg-gray-800 text-white rounded-md hover:bg-gray-700" onClick={() => searchByUrlAddHistory("gemini://geminiprotocol.net/docs/faq.gmi")}>
              Gemini FAQ
            </Button>
            <Button className="bg-gray-800 text-white rounded-md hover:bg-gray-700" onClick={() => searchByUrlAddHistory("gemini://gemi.dev/cgi-bin/wp.cgi/")}>
              Gemipedia
            </Button>
            <Button className="bg-gray-800 text-white rounded-md hover:bg-gray-700" onClick={() => searchByUrlAddHistory("gemini://cdg.thegonz.net/")}>
              TheGonz
            </Button>
          </div>
        </header>

        <main className="m-4 bg-gray-900 rounded-lg flex-grow">
          <div className="p-6">
            {result === null ? (
              <Error404 />
            ) : (
              result.map((item, index) => (
                <React.Fragment key={index}>{renderContent(item)}</React.Fragment>
              ))
            )}
          </div>
        </main>
      </div>
    </React.Fragment>
  );
}
