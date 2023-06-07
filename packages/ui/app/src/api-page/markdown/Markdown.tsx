import classNames from "classnames";
import React from "react";
import ReactMarkdown from "react-markdown";
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

export const Markdown: React.FC<Markdown.Props> = ({ children, className }) => {
    return (
        <ReactMarkdown
            className={classNames(className, styles.container, "prose prose-sm dark:prose-invert max-w-none")}
            remarkPlugins={REMARK_PLUGINS}
            rehypePlugins={REHYPE_PLUGINS}
        >
            {children}
        </ReactMarkdown>
    );
};
