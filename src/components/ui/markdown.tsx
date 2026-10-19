import ReactMarkdown from "react-markdown";
import "./prose.css";

// react-markdown does not render raw HTML and strips unsafe URL schemes by default.
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-lite">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
