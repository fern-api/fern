import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";

export type APIWorkspaceLoader = (id?: string) => AbstractAPIWorkspace<unknown> | undefined;
