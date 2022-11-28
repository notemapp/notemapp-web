import {useEffect} from "react";
import {marked} from "marked";
import DOMPurify from "dompurify";

const useMarkdownRenderer = () => {

  useEffect(() => {

    const renderer = {
      heading(text: string, level: number) {
        return `<h${level} class="text-lg font-medium">${text}</h${level}>`;
      },
      paragraph(text: string) {
        return `<p class="text-md">${text}</p>`;
      },
      code(code: string, language: string) {
        return `<pre class="text-md bg-gray-200 p-2 rounded"><code class="text-sm">${code}</code></pre>`;
      },
      link(href: string, title: string, text: string) {
        return `<a href="${href}" class="text-md text-blue-500" target="_blank">${text}</a>`;
      },
      list(body: string, ordered: boolean) {
        return `<${ordered ? 'ol' : 'ul'} class="text-md ml-8">${body}</${ordered ? 'ol' : 'ul'}>`;
      }
    }

    marked.use({ renderer });

  }, []);

  function renderMarkdown(markdown: string) {
    return DOMPurify.sanitize(marked.parse(markdown));
  }

  return {render: renderMarkdown};

};

export default useMarkdownRenderer;