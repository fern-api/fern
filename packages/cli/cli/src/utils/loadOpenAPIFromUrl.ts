import axios from "axios";
import { writeFile } from "fs/promises";
import { dump } from "js-yaml";
import { join } from "path";
import tmp from "tmp-promise";
import { CliContext } from "../cli-context/CliContext";

export async function loadOpenAPIFromUrl({
    url,
    cliContext,
}: {
    url: string;
    cliContext: CliContext;
}): Promise<string> {
    try {
        const response = await axios.get(url);
        const jsonData = response.data;
        const yamlData = dump(jsonData);
        const tmpDir = await tmp.dir();
        const filePath = join(tmpDir.path, "openapi.yml");
        cliContext.logger.debug("tmpDir", tmpDir.path);
        cliContext.logger.debug("filePath", filePath);
        await writeFile(filePath, yamlData);
        return filePath;
    } catch (error) {
        cliContext.logger.debug(`Encountered an error while loading OpenAPI spec: ${JSON.stringify(error)}`);
        return cliContext.failAndThrow(`Failed to load OpenAPI spec from ${url}`);
    }
}
