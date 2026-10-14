import { describe, expect, it } from "vitest";

import { analyzeProtoFile, chooseProtoTarget, findMissingImports, getProtoWarnings } from "../analyzeProto.js";

const PLAIN_SERVICE = `
syntax = "proto3";
import "google/protobuf/empty.proto";
service Greeter { rpc Hello(Req) returns (Res); }
message Req {}
message Res {}
`;

describe("analyzeProtoFile", () => {
    it("detects imports, services, http annotations and streaming", () => {
        const analysis = analyzeProtoFile({
            relativePath: "a.proto",
            contents: `
import "google/api/annotations.proto";
import public "other.proto";
service S {
  rpc A(Req) returns (Res) { option (google.api.http) = { get: "/a" }; }
  rpc B(stream Req) returns (Res);
}`
        });
        expect(analysis).toEqual({
            relativePath: "a.proto",
            imports: ["google/api/annotations.proto", "other.proto"],
            hasService: true,
            hasHttpAnnotation: true,
            hasStreamingRpc: true,
            unsupportedWellKnownTypes: []
        });
    });

    it("finds each unsupported well-known type once, and ignores supported ones and commented-out ones", () => {
        const analysis = analyzeProtoFile({
            relativePath: "a.proto",
            contents: `
message M {
  google.protobuf.Struct a = 1;
  google.protobuf.Struct b = 2;
  google.protobuf.FieldMask mask = 3;
  google.protobuf.Timestamp ok = 4;
  // google.protobuf.Struct c = 5;
}`
        });
        expect(analysis.unsupportedWellKnownTypes).toEqual(["google.protobuf.Struct", "google.protobuf.FieldMask"]);
    });

    it("detects a server-streaming response", () => {
        const analysis = analyzeProtoFile({
            relativePath: "a.proto",
            contents: "service S { rpc A(Req) returns (stream Res); }"
        });
        expect(analysis.hasStreamingRpc).toBe(true);
    });

    it("ignores anything inside comments", () => {
        const analysis = analyzeProtoFile({
            relativePath: "a.proto",
            contents: `
// service Fake { rpc X(stream A) returns (B); }
/* import "commented/out.proto"; option (google.api.http) = {}; */
message M {}`
        });
        expect(analysis).toMatchObject({
            imports: [],
            hasService: false,
            hasHttpAnnotation: false,
            hasStreamingRpc: false
        });
    });

    it("does not treat // inside a string as a comment", () => {
        const analysis = analyzeProtoFile({
            relativePath: "a.proto",
            contents: `service S { rpc A(Req) returns (Res) { option (google.api.http) = { get: "http://x/y" }; } }`
        });
        expect(analysis).toMatchObject({ hasService: true, hasHttpAnnotation: true });
    });
});

describe("chooseProtoTarget", () => {
    it("picks the one file that defines a service", () => {
        const files = [
            analyzeProtoFile({ relativePath: "types.proto", contents: "message M {}" }),
            analyzeProtoFile({ relativePath: "svc/v1/svc.proto", contents: PLAIN_SERVICE })
        ];
        expect(chooseProtoTarget({ files })).toBe("svc/v1/svc.proto");
    });

    it("leaves the target unset when several files define services, or none do", () => {
        const service = (relativePath: string) => analyzeProtoFile({ relativePath, contents: PLAIN_SERVICE });
        expect(chooseProtoTarget({ files: [service("a.proto"), service("b.proto")] })).toBeUndefined();
        expect(
            chooseProtoTarget({ files: [analyzeProtoFile({ relativePath: "t.proto", contents: "message M {}" })] })
        ).toBeUndefined();
    });
});

describe("findMissingImports", () => {
    it("skips well-known imports and ones that exist, and returns the rest sorted", () => {
        const files = [
            analyzeProtoFile({
                relativePath: "a.proto",
                contents: `
import "google/protobuf/timestamp.proto";
import "b.proto";
import "z/missing.proto";
import "google/api/annotations.proto";`
            })
        ];
        expect(findMissingImports({ files, existingPaths: new Set(["a.proto", "b.proto"]) })).toEqual([
            "google/api/annotations.proto",
            "z/missing.proto"
        ]);
    });
});

describe("getProtoWarnings", () => {
    it("warns when there is no service", () => {
        const files = [analyzeProtoFile({ relativePath: "t.proto", contents: "message M {}" })];
        expect(getProtoWarnings({ files })).toEqual([expect.stringContaining("No gRPC `service`")]);
    });

    it("warns about a service without google.api.http annotations", () => {
        const files = [analyzeProtoFile({ relativePath: "svc.proto", contents: PLAIN_SERVICE })];
        const warnings = getProtoWarnings({ files });
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain("svc.proto");
        expect(warnings[0]).toContain("google.api.http");
    });

    it("warns about streaming RPCs", () => {
        const files = [
            analyzeProtoFile({
                relativePath: "svc.proto",
                contents: `service S { rpc A(stream Req) returns (Res) { option (google.api.http) = { post: "/a" }; } }`
            })
        ];
        const warnings = getProtoWarnings({ files });
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain("streaming");
    });

    it("warns about well-known types the C# generator cannot build", () => {
        const files = [
            analyzeProtoFile({
                relativePath: "svc.proto",
                contents: `service S { rpc A(Req) returns (Res) { option (google.api.http) = { get: "/a" }; } }
message Req { google.protobuf.Struct meta = 1; }`
            })
        ];
        const warnings = getProtoWarnings({ files });
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain("google.protobuf.Struct");
    });

    it("has nothing to say about a unary, annotated service", () => {
        const files = [
            analyzeProtoFile({
                relativePath: "svc.proto",
                contents: `service S { rpc A(Req) returns (Res) { option (google.api.http) = { get: "/a" }; } }`
            })
        ];
        expect(getProtoWarnings({ files })).toEqual([]);
    });
});
