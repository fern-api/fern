import { App } from "@fern-api/ui";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/serialization/resources/docs/resources/v2/resources/read";
import { GetServerSideProps } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export declare namespace Docs {
    export interface Props {
        docs: FernRegistryDocsRead.LoadDocsForUrlResponse.Raw;
        pathname: string;
    }
}

export default function Docs({ docs, pathname }: Docs.Props): JSX.Element {
    return (
        <main className={inter.className}>
            <Head>
                {docs.definition.config.title != null && <title>{docs.definition.config.title}</title>}
                {docs.definition.config.favicon != null && (
                    <link rel="icon" id="favicon" href={docs.definition.files[docs.definition.config.favicon]}></link>
                )}
            </Head>
            <App docs={docs} pathname={pathname} />
        </main>
    );
}

export const getServerSideProps: GetServerSideProps<Pick<Docs.Props, "pathname">> = async (context) => {
    return {
        props: {
            pathname: context.query.slug != null ? (context.query.slug as string[]).join("/") : "",
        },
    };
};
