"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownViewerProps {
  filePath: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export default function MarkdownViewer({
  filePath,
  title,
  subtitle,
  onClose,
}: MarkdownViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(filePath)
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setContent("Failed to load content.");
        setLoading(false);
      });
  }, [filePath]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/95 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={onClose}
          >
            ✕ Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
              prose-h1:text-3xl prose-h1:mb-6 prose-h1:pb-3 prose-h1:border-b prose-h1:border-gray-200 dark:prose-h1:border-gray-700
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100 dark:prose-h2:border-gray-800
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:my-4
              prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-3
              prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed
              prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold
              prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-lg prose-pre:my-6
              prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-6
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              ">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
