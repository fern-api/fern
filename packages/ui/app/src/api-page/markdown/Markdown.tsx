import { Code } from "@blueprintjs/core";
import classNames from "classnames";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
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
                pre({ className, ...props }) {
                    return <pre className={classNames(className, "border border-border/60")} {...props} />;
                },
                code({ node, inline = false, className, children, ...props }) {
                    if (!inline && className != null) {
                        const match = PRISM_CLASSNAME_REGEX.exec(className);
                        if (match != null) {
                            return (
                                <SyntaxHighlighter
                                    {...props}
                                    style={vscDarkPlus}
                                    customStyle={{
                                        backgroundColor: "transparent",
                                        padding: 0,
                                        fontSize: "0.9rem",
                                    }}
                                    language={match[1]}
                                    PreTag="div"
                                >
                                    {String(children)}
                                </SyntaxHighlighter>
                            );
                        }
                    }
                    return (
                        <Code
                            {...props}
                            className={classNames(
                                className,
                                "border border-border/60 !bg-neutral-900/50 !text-white !py-0.5 !px-1"
                            )}
                        >
                            {children}
                        </Code>
                    );
                },
                table({ node, ...props }) {
                    return <table {...props} className={classNames(props.className, "block overflow-x-auto")} />;
                },
                th({ node, ...props }) {
                    return (
                        <th
                            {...props}
                            className={classNames(props.className, "text-sm font-normal text-text-stark  leading-7")}
                        />
                    );
                },
                td({ node, ...props }) {
                    return (
                        <td
                            {...props}
                            className={classNames(props.className, "text-base font-light text-text-default leading-7")}
                        />
                    );
                },
                h1: ({ node, ...props }) => (
                    <h1 {...props} className={classNames(props.className, "text-2xl font-semibold mt-10 mb-3")} />
                ),
                h2: ({ node, ...props }) => (
                    <h2 {...props} className={classNames(props.className, "text-xl font-semibold mt-10 mb-3")} />
                ),
                h3: ({ node, ...props }) => (
                    <h3 {...props} className={classNames(props.className, "text-lg font-semibold mt-10 mb-3")} />
                ),
                h4: ({ node, ...props }) => (
                    <h4 {...props} className={classNames(props.className, "text-lg font-semibold mt-10 mb-3")} />
                ),
                h5: ({ node, ...props }) => (
                    <h5 {...props} className={classNames(props.className, "text-lg font-semibold mt-10 mb-3")} />
                ),
                h6: ({ node, ...props }) => (
                    <h6 {...props} className={classNames(props.className, "text-lg font-semibold mt-10 mb-3")} />
                ),
                p: ({ node, ...props }) => (
                    <p
                        {...props}
                        className={classNames("mb-3 text-base font-light text-text-default leading-7", props.className)}
                    />
                ),
                ul: ({ node, ...props }) => (
                    <ul {...props} className={classNames("list-image-dash", props.className)} />
                ),
                li: ({ node, ...props }) => (
                    <li
                        {...props}
                        className={classNames("text-base font-light text-text-default leading-7", props.className)}
                    />
                ),
                a: ({ node, ...props }) => (
                    <a
                        {...props}
                        className={classNames(
                            "transition !text-white hover:!text-accentPrimary !no-underline !border-b hover:!border-b-2 !border-b-accentPrimary hover:border-b-accentPrimary hover:no-underline font-medium",
                            props.className
                        )}
                    />
                ),
            }}
        >
            {children}
        </ReactMarkdown>
    );
});
