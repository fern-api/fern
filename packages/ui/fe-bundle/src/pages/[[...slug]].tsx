import { App } from "@fern-api/ui";
import { GetServerSideProps } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export declare namespace Docs {
    export interface Props {
        url: string;
        pathname: string;
    }
}

export default function Docs({ url, pathname }: Docs.Props): JSX.Element {
    return (
        <main className={inter.className}>
            <App url={url} pathname={pathname} />
        </main>
    );
}

export const getServerSideProps: GetServerSideProps<Docs.Props> = async (context) => {
    const host = context.req.headers.host;
    if (host == null) {
        throw new Error("Request host is not defined");
    }
    return {
        props: {
            url: `${host}${context.resolvedUrl}`,
            pathname: context.query.slug != null ? (context.query.slug as string[]).join("/") : "",
        },
    };
};
