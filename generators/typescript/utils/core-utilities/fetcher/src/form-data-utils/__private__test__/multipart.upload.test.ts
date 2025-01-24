import { Blob } from "buffer";
import express from "express";
import fs from "fs";
import { Server } from "http";
import multer from "multer";

import { newFormData } from "../..";
import { getFetchFn } from "../../fetcher/getFetchFn";
import { RUNTIME } from "../../runtime";

describe("Multipart Form Data Tests", () => {
    const app = express();
    let s: Server;

    beforeAll(async () => {
        const storage = multer.memoryStorage();
        const upload = multer({ storage });
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
                res.status(500).send("Error uploading file.");
            }
            return res.status(200).send("File uploaded successfully.");
        });
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        s = app.listen(4567, () => {});
    });

    it("should reflect that blob of blob has same content as blob", async () => {
        const b = new Blob(["test"]);
        const c = new Blob([b]);

        expect(b.text).toBe(c.text);
    });

    it("should return a 200 status code for Blob", async () => {
        const fdw = await newFormData();

        const y = fs.readFileSync("package.json");

        await fdw.appendFile("file", new Blob([new Uint8Array(y)]), "asda");

        const fetch = await getFetchFn();
        const response = await fetch("http://localhost:4567/upload", {
            method: "POST",
            ...(await fdw.getRequest()),
            ...(RUNTIME.parsedVersion && RUNTIME.parsedVersion < 18 ? {} : { duplex: "half" })
        });

        expect(response.status).toBe(200);
    });

    it("should return a 200 status code for File", async () => {
        // File does not exist in Node < 20
        if (RUNTIME.parsedVersion && RUNTIME.parsedVersion >= 20) {
            const fdw = await newFormData();

            const y = fs.readFileSync("package.json");
            await fdw.appendFile("file", new File([y], "package.json"));

            const fetch = await getFetchFn();

            const response = await fetch("http://localhost:4567/upload", {
                method: "POST",
                ...(await fdw.getRequest()),
                ...(RUNTIME.parsedVersion && RUNTIME.parsedVersion < 18 ? {} : { duplex: "half" })
            });

            // eslint-disable-next-line jest/no-conditional-expect
            expect(response.status).toBe(200);
        }
    });

    it("should return a 200 status code for fs.ReadStream", async () => {
        const fdw = await newFormData();

        const y = fs.createReadStream("package.json");
        await fdw.appendFile("file", y);

        const fetch = await getFetchFn();

        const response = await fetch("http://localhost:4567/upload", {
            method: "POST",
            ...(await fdw.getRequest()),
            ...(RUNTIME.parsedVersion && RUNTIME.parsedVersion < 18 ? {} : { duplex: "half" })
        });

        expect(response.status).toBe(200);
    });

    afterAll(async () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        s.close(() => {});
    });
});
