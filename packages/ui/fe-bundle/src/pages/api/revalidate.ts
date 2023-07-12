import { NextApiHandler } from "next";

const handler: NextApiHandler = async (_req, res) => {
    try {
        // this should be the actual path not a rewritten path
        // e.g. for "/blog/[slug]" this should be "/blog/post-1"
        await res.revalidate(`/${encodeURIComponent("devtest.buildwithfern.com")}`);
        return res.json({ revalidated: true });
    } catch (err) {
        // If there was an error, Next.js will continue
        // to show the last successfully generated page
        return res.status(500).send("Error revalidating");
    }
};

export default handler;
