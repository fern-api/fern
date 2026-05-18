import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { AdminClient } from "../resources/admin/client/Client.js";
import { HomepageClient } from "../resources/homepage/client/Client.js";
import { MigrationClient } from "../resources/migration/client/Client.js";
import { PlaylistClient } from "../resources/playlist/client/Client.js";
import { ProblemClient } from "../resources/problem/client/Client.js";
import { SubmissionClient } from "../resources/submission/client/Client.js";
import { SyspropClient } from "../resources/sysprop/client/Client.js";
import { V2Client } from "../resources/v2/client/Client.js";
export declare namespace TraceClient {
    type Options = BaseClientOptions;
}
export declare class TraceClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<TraceClient.Options>;
    protected _v2: V2Client | undefined;
    protected _admin: AdminClient | undefined;
    protected _homepage: HomepageClient | undefined;
    protected _migration: MigrationClient | undefined;
    protected _playlist: PlaylistClient | undefined;
    protected _problem: ProblemClient | undefined;
    protected _submission: SubmissionClient | undefined;
    protected _sysprop: SyspropClient | undefined;
    constructor(options: TraceClient.Options);
    get v2(): V2Client;
    get admin(): AdminClient;
    get homepage(): HomepageClient;
    get migration(): MigrationClient;
    get playlist(): PlaylistClient;
    get problem(): ProblemClient;
    get submission(): SubmissionClient;
    get sysprop(): SyspropClient;
}
