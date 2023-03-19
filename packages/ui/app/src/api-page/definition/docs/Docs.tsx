import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export declare namespace Docs {
    export interface Props {
        docs: string;
    }
}

const REMARK_PLUGINS = [remarkGfm];

export const Docs: React.FC<Docs.Props> = ({ docs }) => {
    return (
        <ReactMarkdown className="prose" remarkPlugins={REMARK_PLUGINS}>
            {docs}
        </ReactMarkdown>
    );
};
