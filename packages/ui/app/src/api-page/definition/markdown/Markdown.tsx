import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export declare namespace Markdown {
    export interface Props {
        children: string;
    }
}

const REMARK_PLUGINS = [remarkGfm];

export const Markdown: React.FC<Markdown.Props> = ({ children }) => {
    return (
        <ReactMarkdown
            className="prose prose-sm dark:prose-invert prose-code:before:content-none prose-code:after:content-none prose-code:bg-slate-700 prose-code:py-px prose-code:px-1 prose-code:rounded"
            remarkPlugins={REMARK_PLUGINS}
        >
            {children}
        </ReactMarkdown>
    );
};
