import { deploy } from "@fern-api/docs-deploy";
import path from "path";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

void deploy({
    distDirectory: path.join(__dirname, "../dist"),
});
