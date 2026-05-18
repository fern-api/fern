import type * as SeedApi from "../../../index.js";
export type Metadata = SeedApi.examples.Metadata.Html | SeedApi.examples.Metadata.Markdown;
export declare namespace Metadata {
    interface Html extends _Base {
        type: "html";
        value?: string | undefined;
    }
    interface Markdown extends _Base {
        type: "markdown";
        value?: string | undefined;
    }
    interface _Base {
        extra: Record<string, string>;
        tags: string[];
    }
}
