export interface Document {
    id: string;
    title: string;
    content: string;
    author: string | null;
    tags?: (string[] | null) | undefined;
}
