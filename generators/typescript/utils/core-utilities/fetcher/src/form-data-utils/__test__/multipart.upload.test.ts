import express from "express";
import fs from "fs";
import { killPortProcess } from "kill-port-process";
import multer from "multer";
import { newFormData } from "../..";
import { getFetchFn } from "../../fetcher/getFetchFn";

describe("Multipart Form Data Tests", () => {
    let app = express();

    beforeAll(async () => {
        const storage = multer.memoryStorage();
        const upload = multer({ storage: storage });

        // Define the file upload route
        app.post("/upload", upload.any(), (req: any, res: any) => {
            try {
                if (!req.files) {
                    return res.status(400).send("No file uploaded.");
                } else {
                    const file = req.files && req.files[0];
                    return res.status(200).send(`File sent: ${file.originalname}`);
                }
            } catch (error) {
                console.log(error);
                res.status(500).send("Error uploading file.");
            }
            return res.status(200).send("File uploaded successfully.");
        });

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.listen(4567, () => {
            // console.log("Server started on http://localhost:4567");
        });
    });

    it("should reflect that blob of blob has same content as blob", async () => {
        const b = new Blob(["test"]);
        const c = new Blob([b]);

        expect(await b.text).toBe(await c.text);
    });

    it("should return a 200 status code", async () => {
        const fdw = await newFormData();

        const y = fs.readFileSync("package.json");
        await fdw.appendFile("file", y, "package.json");

        let fetch = await getFetchFn();

        const response = await fetch("http://localhost:4567/upload", {
            method: "POST",
            ...(await fdw.getRequest())
        });

        expect(response.status).toBe(200);
    });

    afterAll(async () => {
        setTimeout(async () => await killPortProcess(4567), 500);
    });
});
