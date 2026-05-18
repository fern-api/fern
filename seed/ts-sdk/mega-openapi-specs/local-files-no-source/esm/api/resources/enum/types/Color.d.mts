export declare const Color: {
    readonly Red: "red";
    readonly Blue: "blue";
};
export type Color = (typeof Color)[keyof typeof Color];
