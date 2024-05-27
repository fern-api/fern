import WhatwgMIMEType from "whatwg-mimetype";

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
export class MediaType {
    private constructor(
        readonly type: string,
        readonly subtype: string,
        readonly essence: string,
        readonly parameters: WhatwgMIMEType.MIMETypeParameters,
        private mimeType: WhatwgMIMEType,
        private input: string
    ) {}

    static APPLICATION_JSON = "application/json";
    static APPLICATION_OCTET_STREAM = "application/octet-stream";
    static MULTIPART_FORM_DATA = "multipart/form-data";

    static parse(input: string | null | undefined): MediaType | null {
        if (input == null) {
            return null;
        }
        const parsed = WhatwgMIMEType.parse(input);
        if (parsed == null) {
            return null;
        }
        return new MediaType(parsed.type, parsed.subtype, parsed.essence, parsed.parameters, parsed, input);
    }

    public toString(): string {
        return this.input;
    }

    /** Types */

    public isText(): boolean {
        return this.type === "text";
    }

    public isImage(): boolean {
        return this.type === "image";
    }

    public isAudio(): boolean {
        return this.type === "audio";
    }

    public isVideo(): boolean {
        return this.type === "video";
    }

    public isFont(): boolean {
        return this.type === "font";
    }

    public isMultipart(): boolean {
        return this.type === "multipart";
    }

    public isApplication(): boolean {
        return this.type === "application";
    }

    public isMessage(): boolean {
        return this.type === "message";
    }

    public isModel(): boolean {
        return this.type === "model";
    }

    /** Text */

    public isCSS(): boolean {
        return this.isText() && this.subtype === "css";
    }

    public isCSV(): boolean {
        return this.isText() && this.subtype === "csv";
    }

    public isMarkdown(): boolean {
        return this.isText() && this.subtype === "markdown";
    }

    public isPlainText(): boolean {
        return this.isText() && this.subtype === "plain";
    }

    /** Multipart */

    public isMultiPartFormData(): boolean {
        return this.isMultipart() && this.subtype === "form-data";
    }

    /** Application */

    public isJSON(): boolean {
        return this.isApplication() && this.subtype === "json";
    }

    public isURLEncoded(): boolean {
        return this.isApplication() && this.subtype === "x-www-form-urlencoded";
    }

    public isOctetStream(): boolean {
        return this.isApplication() && this.subtype === "octet-stream";
    }

    public isPDF(): boolean {
        return this.isApplication() && this.subtype === "pdf";
    }

    public isZip(): boolean {
        return this.isApplication() && this.subtype === "zip";
    }

    public isGzip(): boolean {
        return this.isApplication() && this.subtype === "gzip";
    }

    public isTar(): boolean {
        return this.isApplication() && this.subtype === "tar";
    }

    public isBrotli(): boolean {
        return this.isApplication() && this.subtype === "br";
    }

    public isDeflate(): boolean {
        return this.isApplication() && this.subtype === "deflate";
    }

    public isProtobuf(): boolean {
        return this.isApplication() && this.subtype === "protobuf";
    }

    /** Images */

    public isAvif(): boolean {
        return this.isImage() && this.subtype === "avif";
    }

    public isWebP(): boolean {
        return this.isImage() && this.subtype === "webp";
    }

    public isSVG(): boolean {
        return this.isImage() && this.subtype === "svg+xml";
    }

    public isPNG(): boolean {
        return this.isImage() && this.subtype === "png";
    }

    public isJPEG(): boolean {
        return this.isImage() && this.subtype === "jpeg";
    }

    public isGIF(): boolean {
        return this.isImage() && this.subtype === "gif";
    }

    /** Audio */

    public isMPEG(): boolean {
        return this.isAudio() && this.subtype === "mpeg";
    }

    public isWAV(): boolean {
        return this.isAudio() && this.subtype === "wav";
    }

    /** Mixed */

    public isHTML(): boolean {
        return this.mimeType.isHTML();
    }

    public isXML(): boolean {
        return this.mimeType.isXML();
    }

    public isJavaScript(): boolean {
        return this.mimeType.isJavaScript();
    }
}
