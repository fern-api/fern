import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { AdminClient } from "../resources/admin/client/Client.mjs";
import { HomepageClient } from "../resources/homepage/client/Client.mjs";
import { MigrationClient } from "../resources/migration/client/Client.mjs";
import { PlaylistClient } from "../resources/playlist/client/Client.mjs";
import { ProblemClient } from "../resources/problem/client/Client.mjs";
import { SubmissionClient } from "../resources/submission/client/Client.mjs";
import { SyspropClient } from "../resources/sysprop/client/Client.mjs";
import { V2Client } from "../resources/v2/client/Client.mjs";
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
