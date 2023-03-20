import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export declare namespace Markdown {
    export interface Props {
        docs: string;
    }
}

const REMARK_PLUGINS = [remarkGfm];

export const Markdown: React.FC<Markdown.Props> = ({ docs }) => {
    return (
        <ReactMarkdown className="prose" remarkPlugins={REMARK_PLUGINS}>
            {docs}
        </ReactMarkdown>
    );
};
