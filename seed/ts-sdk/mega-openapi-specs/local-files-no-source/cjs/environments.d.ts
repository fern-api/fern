export interface SeedApiEnvironmentUrls {
    base: string;
    auth: string;
    upload: string;
}
export declare const SeedApiEnvironment: {
    readonly Production: {
        readonly base: "https://production.com/api";
        readonly auth: "https://auth.example.com/oauth2";
        readonly upload: "https://upload.example.com/2.0";
    };
    readonly Auth: {
        readonly base: "https://auth.example.com/oauth2";
        readonly auth: "https://auth.example.com/oauth2";
        readonly upload: "https://upload.example.com/2.0";
    };
    readonly Upload: {
        readonly base: "https://upload.example.com/2.0";
        readonly auth: "https://auth.example.com/oauth2";
        readonly upload: "https://upload.example.com/2.0";
    };
};
export type SeedApiEnvironment = typeof SeedApiEnvironment.Production | typeof SeedApiEnvironment.Auth | typeof SeedApiEnvironment.Upload;
