import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export declare namespace Markdown {
    export interface Props {
        children: string;
    }
}

const REMARK_PLUGINS = [remarkGfm];

export const Markdown: React.FC<Markdown.Props> = ({ children }) => {
    return <ReactMarkdown remarkPlugins={REMARK_PLUGINS}>{children}</ReactMarkdown>;
};
