import { App } from "@fern-api/ui";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function X(_props: { params: { slug: string[] } }): JSX.Element {
    return (
        <main className={inter.className}>
            <App />
        </main>
    );
}
