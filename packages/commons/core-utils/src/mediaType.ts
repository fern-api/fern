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
    static TEXT_PLAIN = "text/plain";
    static TEXT_HTML = "text/html";
    static TEXT_XML = "text/xml";
    static APPLICATION_XML = "application/xml";
    static APPLICATION_FORM_URLENCODED = "application/x-www-form-urlencoded";

    static parse(input: string | null | undefined): MediaType | null {
        if (input == null || input.trim() === "") {
            return null;
        }
        
        // Normalize input by trimming whitespace
        const normalizedInput = input.trim();
        
        const parsed = WhatwgMIMEType.parse(normalizedInput);
        if (parsed == null) {
            return null;
        }
        return new MediaType(parsed.type, parsed.subtype, parsed.essence, parsed.parameters, parsed, normalizedInput);
    }

    public toString(): string {
        return this.input;
    }

    public getCharset(): string | null {
        return this.parameters.get("charset") ?? null;
    }

    public getBoundary(): string | null {
        return this.parameters.get("boundary") ?? null;
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
        return (this.isText() || this.isApplication()) && this.subtype === "csv";
    }

    public isMarkdown(): boolean {
        return this.isText() && (this.subtype === "markdown" || this.subtype === "x-markdown");
    }

    public isPlainText(): boolean {
        return this.isText() && this.subtype === "plain";
    }

    public isRichText(): boolean {
        return this.isText() && this.subtype === "richtext";
    }

    public isDNS(): boolean {
        return this.isText() && this.subtype === "dns";
    }

    public isApplicationText(): boolean {
        return this.isApplication() && this.subtype === "text";
    }

    /** Multipart */

    public isMultiPartFormData(): boolean {
        return this.isMultipart() && this.subtype === "form-data";
    }

    public isMultiPartMixed(): boolean {
        return this.isMultipart() && this.subtype === "mixed";
    }

    public isMultiPartAlternative(): boolean {
        return this.isMultipart() && this.subtype === "alternative";
    }

    public isMultiPartRelated(): boolean {
        return this.isMultipart() && this.subtype === "related";
    }

    /** Application */

    public isJSON(): boolean {
        return this.isApplication() && this.subtype.includes("json");
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
        return this.isApplication() && (this.subtype === "zip" || this.subtype === "x-zip-compressed");
    }

    public isGzip(): boolean {
        return this.isApplication() && (this.subtype === "gzip" || this.subtype === "x-gzip");
    }

    public isTar(): boolean {
        return this.isApplication() && (this.subtype === "tar" || this.subtype === "x-tar");
    }

    public isBrotli(): boolean {
        return this.isApplication() && this.subtype === "br";
    }

    public isDeflate(): boolean {
        return this.isApplication() && this.subtype === "deflate";
    }

    public isProtobuf(): boolean {
        return this.isApplication() && (this.subtype === "protobuf" || this.subtype === "x-protobuf");
    }

    public isExcel(): boolean {
        return this.isApplication() && (
            this.subtype === "vnd.ms-excel" ||
            this.subtype === "vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
    }

    public isWord(): boolean {
        return this.isApplication() && (
            this.subtype === "msword" ||
            this.subtype === "vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
    }

    public isPowerPoint(): boolean {
        return this.isApplication() && (
            this.subtype === "vnd.ms-powerpoint" ||
            this.subtype === "vnd.openxmlformats-officedocument.presentationml.presentation"
        );
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
        return this.isImage() && (this.subtype === "jpeg" || this.subtype === "jpg");
    }

    public isGIF(): boolean {
        return this.isImage() && this.subtype === "gif";
    }

    public isBMP(): boolean {
        return this.isImage() && this.subtype === "bmp";
    }

    public isTIFF(): boolean {
        return this.isImage() && (this.subtype === "tiff" || this.subtype === "tif");
    }

    public isICO(): boolean {
        return this.isImage() && (this.subtype === "x-icon" || this.subtype === "vnd.microsoft.icon");
    }

    /** Audio */

    public isMPEG(): boolean {
        return this.isAudio() && (this.subtype === "mpeg" || this.subtype === "mp3");
    }

    public isWAV(): boolean {
        return this.isAudio() && (this.subtype === "wav" || this.subtype === "wave");
    }

    public isOGG(): boolean {
        return this.isAudio() && this.subtype === "ogg";
    }

    public isAAC(): boolean {
        return this.isAudio() && this.subtype === "aac";
    }

    public isFLAC(): boolean {
        return this.isAudio() && this.subtype === "flac";
    }

    /** Video */

    public isMP4(): boolean {
        return this.isVideo() && this.subtype === "mp4";
    }

    public isWebM(): boolean {
        return this.isVideo() && this.subtype === "webm";
    }

    public isAVI(): boolean {
        return this.isVideo() && this.subtype === "x-msvideo";
    }

    public isMOV(): boolean {
        return this.isVideo() && this.subtype === "quicktime";
    }

    /** Mixed - using whatwg-mimetype methods */

    public isHTML(): boolean {
        return this.mimeType.isHTML();
    }

    public isXML(): boolean {
        return this.mimeType.isXML() || this.isApplication() && this.subtype.endsWith("+xml");
    }

    public isJavaScript(): boolean {
        return this.mimeType.isJavaScript();
    }

    /** Utility Methods */

    public isBinary(): boolean {
        return this.isImage() ||
               this.isAudio() ||
               this.isVideo() ||
               this.isFont() ||
               this.isOctetStream() ||
               this.isPDF() ||
               this.isZip() ||
               this.isGzip() ||
               this.isTar() ||
               this.isBrotli()
    }

    public isTextBased(): boolean {
        return this.isText() ||
               this.isJSON() ||
               this.isXML() ||
               this.isHTML() ||
               this.isJavaScript() ||
               this.isCSS() ||
               this.isCSV() ||
               this.isMarkdown() ||
               this.isSVG() ||
               this.isDNS() ||
               this.isApplicationText();
    }

    public isStructuredData(): boolean {
        return this.isJSON() ||
               this.isXML() ||
               this.isCSV() ||
               this.isHTML();
    }

    public isFormData(): boolean {
        return this.isURLEncoded() || this.isMultiPartFormData();
    }

    public isCompressed(): boolean {
        return this.isGzip() ||
               this.isBrotli() ||
               this.isDeflate() ||
               this.isZip() ||
               this.isTar();
    }
}