import { readdir } from "fs/promises";
import path from "path";
import { Rule } from "../Rule";

export async function getRules(): Promise<Rule[]> {
    const ruleDirs = (await readdir("./rules", { withFileTypes: true }))
        .filter((item) => item.isDirectory())
        .map(({ name }) => path.join(__dirname, "rules", name));
    return Promise.all(ruleDirs.map((ruleDir) => import(ruleDir)));
}
