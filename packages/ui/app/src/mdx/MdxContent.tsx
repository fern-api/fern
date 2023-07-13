import classNames from "classnames";
import { MDXRemote, MDXRemoteProps, MDXRemoteSerializeResult } from "next-mdx-remote";
import React from "react";
import { Card } from "./components/Card";
import { Cards } from "./components/Cards";

export declare namespace MdxContent {
    export interface Props {
        mdx: MDXRemoteSerializeResult;
    }
}

const COMPONENTS: MDXRemoteProps["components"] = {
    h1: (props) => <h1 {...props} className={classNames("text-2xl font-semibold mt-10 mb-3", props.className)} />,
    h2: (props) => <h2 {...props} className={classNames("text-xl font-semibold mt-10 mb-3", props.className)} />,
    h3: (props) => <h3 {...props} className={classNames("text-lg font-semibold mt-10 mb-3", props.className)} />,
    h4: (props) => <h4 {...props} className={classNames("text-lg font-semibold mt-10 mb-3", props.className)} />,
    h5: (props) => <h5 {...props} className={classNames("text-lg font-semibold mt-10 mb-3", props.className)} />,
    h6: (props) => <h6 {...props} className={classNames("text-lg font-semibold mt-10 mb-3", props.className)} />,
    p: (props) => <p {...props} className={classNames("mb-3 text-base font-light leading-7", props.className)} />,
    P: (props) => <p {...props} className={classNames("mb-3 text-base", props.className)} />,
    ul: (props) => <ul {...props} className={classNames("list-none", props.className)} />,
    li: ({ children, ...rest }) => (
        <li {...rest} className={classNames("mb-3 flex items-center space-x-3", rest.className)}>
            <div>{children}</div>
        </li>
    ),
    code: (props) => <code {...props} className={classNames("px-2 py-1 bg-white/10 rounded", props.className)} />,
    a: (props) => (
        <a
            {...props}
            className={classNames(
                "transition pb-[2px] !text-white hover:!text-accentPrimary no-underline border-b border-b-accentPrimary hover:border-b-accentPrimary hover:no-underline font-medium",
                props.className
            )}
        />
    ),
    Cards,
    Card,
};

export const MdxContent = React.memo<MdxContent.Props>(function MdxContent({ mdx }) {
    return <MDXRemote {...mdx} components={COMPONENTS}></MDXRemote>;
});
