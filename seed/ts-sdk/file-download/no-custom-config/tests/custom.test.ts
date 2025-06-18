import { writeFile } from "fs/promises";
import { SeedFileDownloadClient } from "../src";
import { Readable } from "stream";

describe("test", () => {
    it("stream", async () => {
        const client = new SeedFileDownloadClient({
            environment: "http://localhost:8080"
        });
        const response = await client.service.downloadFile();
        console.log(response)
        await writeFile("fern.svg", Readable.fromWeb(response.stream() as import("stream/web").ReadableStream));
    });

    it("blob", async () => {
        const client = new SeedFileDownloadClient({
            environment: "http://localhost:8080"
        });
        const response = await client.service.downloadFile();
        console.log(response);
        const blob = await response.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        await writeFile("fern.blob.svg", buffer);
    });

    it("buffer", async () => {
        const client = new SeedFileDownloadClient({
            environment: "http://localhost:8080"
        });
        const response = await client.service.downloadFile();
        console.log(response);
        const arrayBuffer = await response.arrayBuffer();
        await writeFile("fern.buffer.svg", Buffer.from(arrayBuffer));
    });

    it("text", async () => {
        const client = new SeedFileDownloadClient({
            environment: "http://localhost:8080"
        });
        const response = await client.service.downloadFile();
        console.log(response);
        const text = await response.text();
        await writeFile("fern.text.svg", text);
    });
});
