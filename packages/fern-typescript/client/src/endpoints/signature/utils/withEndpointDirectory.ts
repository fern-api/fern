import { withDirectory } from "@fern-typescript/commons";
import { Directory } from "ts-morph";

export declare namespace withEndpointDirectory {
    export interface Args {
        endpointId: string;
        serviceDirectory: Directory;
    }
}

export function withEndpointDirectory(
    { endpointId, serviceDirectory }: withEndpointDirectory.Args,
    run: (endpointDirectory: Directory) => void
): void {
    withDirectory(
        {
            containingModule: serviceDirectory,
            name: "endpoints",
            namespaceExport: "Endpoints",
        },
        (endpointsDirectory) => {
            withDirectory(
                {
                    containingModule: endpointsDirectory,
                    name: endpointId,
                    namespaceExport: endpointId,
                },
                run
            );
        }
    );
}
