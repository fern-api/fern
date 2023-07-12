import { NextApiHandler } from "next";

interface RequestBody {
    urls: string[];
}

const handler: NextApiHandler = async (req, res) => {
    const { urls } = req.body as RequestBody;
    try {
        // this should be the actual path not a rewritten path
        // e.g. for "/blog/[slug]" this should be "/blog/post-1"
        await res.revalidate("/");
        for (const url of urls) {
            await res.revalidate(`/${url}`);
            await res.revalidate(`/${url}/`);
        }
        return res.json({ revalidated: true });
    } catch (err) {
        // If there was an error, Next.js will continue
        // to show the last successfully generated page
        return res.status(500).send("Error revalidating");
    }
};

export default handler;
