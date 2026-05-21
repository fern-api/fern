import { CliError, TaskAbortSignal } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { ExitCode, exitCodeForCliErrorCode, exitCodeForError } from "../errors/exitCode.js";

describe("exitCodeForCliErrorCode", () => {
    it("maps usage errors to ExitCode.Usage (sysexits-aligned 2)", () => {
        expect(exitCodeForCliErrorCode(CliError.Code.UserError)).toBe(ExitCode.Usage);
    });

    it("maps validation / parse / IR / reference errors to DataErr (65)", () => {
        expect(exitCodeForCliErrorCode(CliError.Code.ValidationError)).toBe(ExitCode.DataErr);
        expect(exitCodeForCliErrorCode(CliError.Code.ParseError)).toBe(ExitCode.DataErr);
        expect(exitCodeForCliErrorCode(CliError.Code.IrConversionError)).toBe(ExitCode.DataErr);
        expect(exitCodeForCliErrorCode(CliError.Code.ReferenceError)).toBe(ExitCode.DataErr);
    });

    it("maps resolution errors to NoInput (66)", () => {
        expect(exitCodeForCliErrorCode(CliError.Code.ResolutionError)).toBe(ExitCode.NoInput);
    });

    it("maps auth errors to NoPerm (77)", () => {
        expect(exitCodeForCliErrorCode(CliError.Code.AuthError)).toBe(ExitCode.NoPerm);
    });

    it("maps config and version errors to Config (78)", () => {
        expect(exitCodeForCliErrorCode(CliError.Code.ConfigError)).toBe(ExitCode.Config);
        expect(exitCodeForCliErrorCode(CliError.Code.VersionError)).toBe(ExitCode.Config);
    });

    it("maps network / container / environment errors to TempFail (75)", () => {
        expect(exitCodeForCliErrorCode(CliError.Code.NetworkError)).toBe(ExitCode.TempFail);
        expect(exitCodeForCliErrorCode(CliError.Code.ContainerError)).toBe(ExitCode.TempFail);
        expect(exitCodeForCliErrorCode(CliError.Code.EnvironmentError)).toBe(ExitCode.TempFail);
    });

    it("maps internal errors to Software (70)", () => {
        expect(exitCodeForCliErrorCode(CliError.Code.InternalError)).toBe(ExitCode.Software);
    });
});

describe("exitCodeForError", () => {
    it("returns Generic for TaskAbortSignal with no code (multi-task failure, error already logged)", () => {
        expect(exitCodeForError(new TaskAbortSignal())).toBe(ExitCode.Generic);
    });

    it("delegates to exitCodeForCliErrorCode for TaskAbortSignal with a code", () => {
        expect(exitCodeForError(new TaskAbortSignal(CliError.Code.AuthError))).toBe(ExitCode.NoPerm);
        expect(exitCodeForError(new TaskAbortSignal(CliError.Code.ValidationError))).toBe(ExitCode.DataErr);
        expect(exitCodeForError(new TaskAbortSignal(CliError.Code.ConfigError))).toBe(ExitCode.Config);
    });

    it("delegates to exitCodeForCliErrorCode for CliError instances", () => {
        const authErr = new CliError({ code: CliError.Code.AuthError, message: "not logged in" });
        expect(exitCodeForError(authErr)).toBe(ExitCode.NoPerm);

        const usageErr = new CliError({ code: CliError.Code.UserError, message: "bad flag" });
        expect(exitCodeForError(usageErr)).toBe(ExitCode.Usage);
    });

    it("returns Software for unhandled Error subclasses", () => {
        expect(exitCodeForError(new Error("kaboom"))).toBe(ExitCode.Software);
        expect(exitCodeForError(new TypeError("nope"))).toBe(ExitCode.Software);
    });

    it("returns Software for non-Error throwables", () => {
        expect(exitCodeForError("string thrown")).toBe(ExitCode.Software);
        expect(exitCodeForError(42)).toBe(ExitCode.Software);
        expect(exitCodeForError(undefined)).toBe(ExitCode.Software);
        expect(exitCodeForError(null)).toBe(ExitCode.Software);
    });

    it("uses canonical signal exit codes (128 + signal number)", () => {
        expect(ExitCode.Sigint).toBe(130);
        expect(ExitCode.Sigterm).toBe(143);
    });
});
