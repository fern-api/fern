import { exec } from "child_process";
import { promisify } from "util";

const promisifiedExec = promisify(exec);
export { promisifiedExec as exec };
