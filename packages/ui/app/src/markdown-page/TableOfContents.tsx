import { marked } from "marked";
import { useMemo } from "react";

export declare namespace TableOfContents {
    export interface Props {
        markdown: string;
    }
}

export const TableOfContents: React.FC<TableOfContents.Props> = ({ markdown }) => {
    const headings = useMemo(() => marked.lexer(markdown).filter(isHeading), [markdown]);
    const minDepth = useMemo(() => Math.min(...headings.map((heading) => heading.depth)), [headings]);

    return (
        <div className="flex flex-col">
            <div className="uppercase semibold mb-3">On this page</div>
            <div className="flex flex-col gap-3">
                {headings.map((heading, index) => (
                    <div
                        key={index}
                        className="text-neutral-400 cursor-pointer hover:text-neutral-300"
                        style={{ marginLeft: 8 * (heading.depth - minDepth) }}
                    >
                        {heading.text}
                    </div>
                ))}
            </div>
        </div>
    );
};

function isHeading(token: marked.Token): token is marked.Tokens.Heading {
    return token.type === "heading";
}
