import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  isUser = false
}) => {
  if (isUser) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  // Parse inline styles (bold, italic, code, links)
  const renderInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold + Italic ***text***
      const boldItalicMatch = remaining.match(/^(\*\*\*|___)(.*?)\1/);
      if (boldItalicMatch) {
        parts.push(
          <strong key={key++} className="font-black italic text-black">
            {boldItalicMatch[2]}
          </strong>
        );
        remaining = remaining.slice(boldItalicMatch[0].length);
        continue;
      }

      // Bold **text** or __text__
      const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
      if (boldMatch) {
        parts.push(
          <strong key={key++} className="font-black text-black">
            {boldMatch[2]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic *text* or _text_ (excluding solitary asterisks)
      const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
      if (italicMatch && italicMatch[2].length > 0) {
        parts.push(
          <em key={key++} className="italic text-zinc-800 font-medium">
            {italicMatch[2]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Inline code `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={key++}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-zinc-100 text-emerald-900 border border-zinc-300 font-mono text-[11px] font-bold"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Plain character or text chunk until next special char
      const nextSpecial = remaining.search(/[\*_`]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        // Just take the single special character if it didn't match formatting
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  // Split content into blocks (paragraphs, headers, lists, code blocks, dividers)
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let blockKey = 0;

  const flushList = () => {
    if (!currentList) return;
    const list = currentList;
    currentList = null;

    if (list.type === 'ul') {
      blocks.push(
        <ul key={`list-${blockKey++}`} className="my-2 space-y-1.5 pl-1">
          {list.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-zinc-800 leading-snug">
              <span className="text-[#00A878] font-black text-xs shrink-0 mt-0.5">●</span>
              <span className="flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      blocks.push(
        <ol key={`list-${blockKey++}`} className="my-2 space-y-1.5 pl-1">
          {list.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-zinc-800 leading-snug">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-black text-white text-[10px] font-black shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Code block toggle
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push(
          <div
            key={`code-${blockKey++}`}
            className="my-3 p-3 bg-zinc-900 text-emerald-300 rounded-xl font-mono text-xs overflow-x-auto border-2 border-black shadow-neo-sm"
          >
            <pre className="whitespace-pre">{codeBlockContent.join('\n')}</pre>
          </div>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(rawLine);
      continue;
    }

    // Horizontal Rule
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushList();
      blocks.push(
        <hr key={`hr-${blockKey++}`} className="my-3 border-t-2 border-black/15" />
      );
      continue;
    }

    // Headers
    if (line.startsWith('#')) {
      flushList();
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];

        if (level === 1) {
          blocks.push(
            <h1
              key={`h1-${blockKey++}`}
              className="text-base sm:text-lg font-black text-black mt-3 mb-1.5 pb-1 border-b-2 border-black flex items-center gap-1.5"
            >
              {renderInline(text)}
            </h1>
          );
        } else if (level === 2) {
          blocks.push(
            <h2
              key={`h2-${blockKey++}`}
              className="text-sm sm:text-base font-black text-black mt-3 mb-1.5 flex items-center gap-1.5 text-[#008080]"
            >
              {renderInline(text)}
            </h2>
          );
        } else if (level === 3) {
          blocks.push(
            <h3
              key={`h3-${blockKey++}`}
              className="text-xs sm:text-sm font-black text-black mt-2.5 mb-1 flex items-center gap-1.5"
            >
              {renderInline(text)}
            </h3>
          );
        } else {
          blocks.push(
            <h4
              key={`h4-${blockKey++}`}
              className="text-xs font-black text-zinc-900 mt-2 mb-1"
            >
              {renderInline(text)}
            </h4>
          );
        }
        continue;
      }
    }

    // Blockquote
    if (line.startsWith('>')) {
      flushList();
      const quoteText = line.replace(/^>\s?/, '');
      blocks.push(
        <div
          key={`quote-${blockKey++}`}
          className="my-2 p-2.5 bg-emerald-50/80 border-l-4 border-emerald-500 rounded-r-xl text-xs font-medium text-emerald-950"
        >
          {renderInline(quoteText)}
        </div>
      );
      continue;
    }

    // Unordered list item (*, -, +)
    const ulMatch = line.match(/^[\*\-\+]\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Ordered list item (1., 2., etc.)
    const olMatch = line.match(/^\d+[\.\)]\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[1]);
      continue;
    }

    // Empty line
    if (!line) {
      flushList();
      continue;
    }

    // Regular paragraph
    flushList();
    blocks.push(
      <p key={`p-${blockKey++}`} className="my-1.5 text-xs sm:text-sm leading-relaxed text-zinc-900">
        {renderInline(line)}
      </p>
    );
  }

  flushList();

  return (
    <div className={`space-y-1 text-xs sm:text-sm ${className}`}>
      {blocks}
    </div>
  );
};
