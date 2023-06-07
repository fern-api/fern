export type CurlExamplePart = CurlExamplePart.Jsx | CurlExamplePart.Line;

export declare namespace CurlExamplePart {
    export interface Jsx {
        type: "jsx";
        jsx: JSX.Element;
    }

    export interface Line {
        type: "line";
        value: string | JSX.Element;
        excludeTrailingBackslash?: boolean;
        excludeIndent?: boolean;
    }
}
