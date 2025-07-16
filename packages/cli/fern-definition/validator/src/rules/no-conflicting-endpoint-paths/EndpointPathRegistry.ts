import { RawSchemas } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { getFullEndpointPath } from "./getFullEndpointPath";

export interface EndpointReference {
    relativeFilepath: RelativeFilePath;
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    endpointId: string;
}

export class EndpointPathRegistry {
    private root = new EndpointPathTreeNode();

    public registerEndpoint(endpointReference: EndpointReference): void {
        this.root.insert(this.getPathPartsForEndpoint(endpointReference), endpointReference);
    }

    public getConflictingEndpoints(endpointReference: EndpointReference): EndpointReference[] {
        return this.root
            .getMatchingEndpoints(this.getPathPartsForEndpoint(endpointReference))
            .filter((matchingEndpoint) => {
                const isEqualToQueryEndpoint =
                    matchingEndpoint.relativeFilepath === endpointReference.relativeFilepath &&
                    matchingEndpoint.endpointId === endpointReference.endpointId;
                return (
                    !isEqualToQueryEndpoint && matchingEndpoint.endpoint.method === endpointReference.endpoint.method
                );
            });
    }

    private getPathPartsForEndpoint(endpointReference: EndpointReference): PathPart[] {
        return getFullEndpointPath({
            service: endpointReference.service,
            endpoint: endpointReference.endpoint
        })
            .split("/")
            .filter((part) => part.length > 0);
    }
}

type PathPart = string;

class EndpointPathTreeNode {
    private childPaths: Record<PathPart, EndpointPathTreeNode> = {};
    private childPathParam: EndpointPathTreeNode | undefined;
    private endpointsThatEndWithThisNode: EndpointReference[] = [];

    public insert(paths: PathPart[], endpointReference: EndpointReference): void {
        const [firstPath, ...remainingPaths] = paths;
        if (firstPath == null) {
            this.endpointsThatEndWithThisNode.push(endpointReference);
            return;
        }

        const nextNode = this.isPathParam(firstPath)
            ? (this.childPathParam ??= new EndpointPathTreeNode())
            : (this.childPaths[firstPath] ??= new EndpointPathTreeNode());

        nextNode.insert(remainingPaths, endpointReference);
    }

    public getMatchingEndpoints(paths: PathPart[]): EndpointReference[] {
        const [firstPath, ...remainingPaths] = paths;

        if (firstPath == null) {
            return this.endpointsThatEndWithThisNode;
        }

        const matchingEndpoints: EndpointReference[] = [];

        if (this.isPathParam(firstPath)) {
            matchingEndpoints.push(
                ...Object.values(this.childPaths).flatMap((childNode) => childNode.getMatchingEndpoints(remainingPaths))
            );
        } else {
            const childPath = this.childPaths[firstPath];
            if (childPath != null) {
                matchingEndpoints.push(...childPath.getMatchingEndpoints(remainingPaths));
            }
        }

        if (this.childPathParam != null) {
            matchingEndpoints.push(...this.childPathParam.getMatchingEndpoints(remainingPaths));
        }

        return matchingEndpoints;
    }

    private isPathParam(pathPart: string): boolean {
        return pathPart.startsWith("{") && pathPart.endsWith("}");
    }
}
