import { describe, expect, it } from "vitest";

import { ProtobufSpecSchema } from "../ProtobufSpecSchema.js";

describe("ProtobufSpecSchema", () => {
    describe("proto.overrides", () => {
        it("should accept single override string", () => {
            const input = {
                proto: {
                    root: "./proto",
                    overrides: "./overrides.yml"
                }
            };
            const result = ProtobufSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should accept array of override strings", () => {
            const input = {
                proto: {
                    root: "./proto",
                    overrides: ["./overrides1.yml", "./overrides2.yml"]
                }
            };
            const result = ProtobufSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should accept undefined overrides", () => {
            const input = {
                proto: {
                    root: "./proto"
                }
            };
            const result = ProtobufSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });
    });
});
