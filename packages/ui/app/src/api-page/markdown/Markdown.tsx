import { Code } from "@blueprintjs/core";
import classNames from "classnames";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import styles from "./Markdown.module.scss";

export declare namespace Markdown {
    export interface Props {
        children: string;
        className?: string;
    }
}

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw];

const PRISM_CLASSNAME_REGEX = /language-(\w+)/;

export const Markdown = React.memo<Markdown.Props>(function Markdown({ children, className }) {
    return (
        <ReactMarkdown
            className={classNames(className, styles.container, "prose prose-sm dark:prose-invert max-w-none")}
            remarkPlugins={REMARK_PLUGINS}
            rehypePlugins={REHYPE_PLUGINS}
            components={{
                code({ node, inline, className, children, ...props }) {
                    if (!inline && className != null) {
                        const match = PRISM_CLASSNAME_REGEX.exec(className);
                        if (match != null) {
                            return (
                                <SyntaxHighlighter
                                    {...props}
                                    style={atomDark}
                                    customStyle={{ backgroundColor: "transparent" }}
                                    language={match[1]}
                                    PreTag="div"
                                >
                                    {String(children)}
                                </SyntaxHighlighter>
                            );
                        }
                    }
                    return (
                        <Code {...props} className={className}>
                            {children}
                        </Code>
                    );
                },
                table({ node, ...props }) {
                    // eslint-disable-next-line @blueprintjs/html-components
                    return <table {...props} className={classNames(props.className, "block overflow-x-auto")} />;
                },
                h1: ({ node, ...props }) => {
                    // eslint-disable-next-line @blueprintjs/html-components
                    return <h1 {...props} className={classNames(props.className, "mt-10")} />;
                },
            }}
        >
            {children}
        </ReactMarkdown>
    );
});
