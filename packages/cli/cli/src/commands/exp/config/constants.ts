import os from "node:os";
import { resolve as resolvePath } from "node:path";
import { LOCAL_STORAGE_FOLDER } from "../../../constants";

export const EXP_CACHE_DIR = resolvePath(os.homedir(), LOCAL_STORAGE_FOLDER, "exp");
export const EXP_GENERATORS_CACHE_DIR = resolvePath(EXP_CACHE_DIR, "generators", "node");
