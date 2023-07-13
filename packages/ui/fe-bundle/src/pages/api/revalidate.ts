import { NextApiHandler, NextApiResponse } from "next";
import { REGISTRY_SERVICE } from "../../service";
import { UrlSlugTree } from "../../url-path-resolver/UrlSlugTree";

// TODO support URLs that have a path component, e.g. buildwithfern.com/docs
const handler: NextApiHandler = async (req, res) => {
    if (typeof req.headers["x-fern-host"] === "string") {
        req.headers.host = req.headers["x-fern-host"];
    }
    const host = req.headers.host;
    if (host == null) {
        return res.status(400).send("No host header");
    }

    const revalidated: string[] = [];
    const failures: string[] = [];

    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: host,
    });
    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch docs", docs.error);
        return res.status(500).send("Faild to load docs for: " + host);
    }
    const urlSlugTree = new UrlSlugTree(docs.body.definition);
    const paths = ["/", ...urlSlugTree.getAllSlugs().map((slug) => `/${slug}`)];

    await Promise.all(
        paths.map(async (path) => {
            const didSucceed = await tryRevalidate(res, path);
            if (didSucceed) {
                revalidated.push(path);
            } else {
                failures.push(path);
            }
        })
    );

    return res.json({ revalidated, failures });
};

async function tryRevalidate(res: NextApiResponse, path: string): Promise<boolean> {
    try {
        await res.revalidate(path);
        return true;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return false;
    }
}

export default handler;
