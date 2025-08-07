import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export class FilePropertyMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(file: FernGeneratorExec.dynamic.FileUploadRequest): string {
        if (file.type === "file") {
            return this.convertFile(file);
        } else {
            return this.convertFileArray(file);
        }
    }

    private convertFile(file: FernGeneratorExec.dynamic.File): string {
        const filename = file.filename ?? "file.txt";
        const content = file.content ?? "";

        // For Rust, we'll use a multipart form approach
        return `multipart::Part::text("${content}")
            .file_name("${filename}")
            .mime_str("${this.getMimeType(filename)}")
            .unwrap()`;
    }

    private convertFileArray(files: FernGeneratorExec.dynamic.FileArray): string {
        const fileStrings = files.value.map((file) => this.convertFile(file));
        return `vec![${fileStrings.join(", ")}]`;
    }

    private getMimeType(filename: string): string {
        const extension = filename.split(".").pop()?.toLowerCase();

        switch (extension) {
            case "json":
                return "application/json";
            case "pdf":
                return "application/pdf";
            case "png":
                return "image/png";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "txt":
                return "text/plain";
            case "csv":
                return "text/csv";
            case "xml":
                return "application/xml";
            default:
                return "application/octet-stream";
        }
    }
}
