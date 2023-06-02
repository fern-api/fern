export type CurlExamplePart = CurlExamplePart.StringLine | CurlExamplePart.Jsx;

export declare namespace CurlExamplePart {
    export interface StringLine {
        type: "stringLine";
        value: string;
        excludeTrailingBackslash?: boolean;
        excludeIndent?: boolean;
    }

    export interface Jsx {
        type: "jsx";
        value: JSX.Element;
    }
}
