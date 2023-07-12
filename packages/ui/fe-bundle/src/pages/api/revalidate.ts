import { NextApiHandler, NextApiResponse } from "next";

interface RequestBody {
    urls: string[];
}

const handler: NextApiHandler = async (req, res) => {
    const { urls } = req.body as RequestBody;
    // eslint-disable-next-line no-console
    console.log("Revalidating host:", req.headers);

    let success = true;

    success &&= await tryRevalidate(res, "/");
    for (const url of urls) {
        success &&= await tryRevalidate(res, `/${url}`);
        success &&= await tryRevalidate(res, `/${url}/`);
    }

    if (success) {
        return res.json({ revalidated: true });
    } else {
        return res.status(500).send("Error revalidating");
    }
};

async function tryRevalidate(res: NextApiResponse, path: string): Promise<boolean> {
    try {
        // this should be the actual path not a rewritten path
        // e.g. for "/blog/[slug]" this should be "/blog/post-1"
        await res.revalidate(path);
        return true;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        // If there was an error, Next.js will continue
        // to show the last successfully generated page
        return false;
    }
}

export default handler;
