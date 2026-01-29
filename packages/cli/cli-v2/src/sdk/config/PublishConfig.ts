import { NpmPublishConfig } from "./NpmPublishConfig";

export interface PublishConfig {
    /** NPM registry configuration */
    npm?: NpmPublishConfig;
}
