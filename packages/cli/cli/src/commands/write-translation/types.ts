export interface ContentTransformation {
    filePath: string;
    language: string;
    sourceLanguage: string;
    originalContent: string;
    transformedContent?: string;
}

export interface ProcessingStats {
    filesProcessed: number;
    filesSkipped: number;
}
