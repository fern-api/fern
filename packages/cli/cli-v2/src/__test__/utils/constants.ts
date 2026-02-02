import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { join } from "path";

export const FIXTURES_DIR = AbsoluteFilePath.of(join(__dirname, "../fixtures"));
