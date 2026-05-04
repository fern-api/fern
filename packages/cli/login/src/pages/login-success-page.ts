import fs from "fs";
import path from "path";

export const LOGIN_SUCCESS_PAGE: string = fs.readFileSync(path.join(__dirname, "login-success.html"), "utf-8");
