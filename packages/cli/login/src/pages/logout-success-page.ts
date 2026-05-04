import fs from "fs";
import path from "path";

export const LOGOUT_SUCCESS_PAGE: string = fs.readFileSync(path.join(__dirname, "logout-success.html"), "utf-8");
