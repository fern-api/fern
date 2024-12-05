import { CodeBlockWriter, ts, WriterFunction } from "ts-morph";

export function writerToString(writer: WriterFunction | string): string {
    if (typeof writer === "string") return writer;
    let result = "";
    // Create a minimal writer context that captures the output
    const writerContext = new CodeBlockWriter();
    // Execute the writer with our context
    writer(writerContext);
    return result;
}
