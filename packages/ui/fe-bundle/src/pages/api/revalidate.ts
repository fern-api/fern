import { NextApiHandler, NextApiResponse } from "next";

interface RequestBody {
    urls: string[];
}

const handler: NextApiHandler = async (req, res) => {
    const { urls } = req.body as RequestBody;
    // eslint-disable-next-line no-console
    console.log("Revalidating host:", JSON.stringify(req.headers, undefined, 4));

    if (typeof req.headers["x-fern-host"] === "string") {
        // eslint-disable-next-line no-console
        console.log("Changing req.headers.host");
        req.headers.host = req.headers["x-fern-host"];
    }

    // eslint-disable-next-line no-console
    console.log("[2] Revalidating host:", JSON.stringify(req.headers, undefined, 4));

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
