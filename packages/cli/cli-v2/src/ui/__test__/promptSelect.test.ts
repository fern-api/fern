import { CliError } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { promptSelect } from "../promptSelect.js";

vi.mock("inquirer", () => ({
    default: {
        prompt: vi.fn()
    }
}));

describe("promptSelect", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("empty choices", () => {
        it("throws CliError immediately regardless of TTY", async () => {
            await expect(
                promptSelect({
                    isTTY: true,
                    message: "Pick one",
                    choices: [],
                    nonInteractiveError: "no options"
                })
            ).rejects.toSatisfy((e) => e instanceof CliError && e.message.includes("No options available"));
        });
    });

    describe("non-TTY mode", () => {
        it("throws CliError with the nonInteractiveError message", async () => {
            await expect(
                promptSelect({
                    isTTY: false,
                    message: "Pick one",
                    choices: [
                        { name: "rest", value: "rest" },
                        { name: "grpc", value: "grpc" }
                    ],
                    nonInteractiveError: "Multiple APIs found: rest, grpc. Use --api to select one."
                })
            ).rejects.toSatisfy(
                (e) =>
                    e instanceof CliError &&
                    e.message.includes("rest") &&
                    e.message.includes("grpc") &&
                    e.message.includes("--api")
            );
        });

        it("never calls inquirer.prompt in non-TTY mode", async () => {
            const inquirer = await import("inquirer");
            await expect(
                promptSelect({
                    isTTY: false,
                    message: "Pick one",
                    choices: [{ name: "rest", value: "rest" }],
                    nonInteractiveError: "error"
                })
            ).rejects.toBeInstanceOf(CliError);
            expect(inquirer.default.prompt).not.toHaveBeenCalled();
        });
    });

    describe("TTY mode — dropdown", () => {
        it("returns the value selected by the user", async () => {
            const inquirer = await import("inquirer");
            vi.mocked(inquirer.default.prompt).mockResolvedValue({ selected: "grpc" });

            const result = await promptSelect({
                isTTY: true,
                message: "Pick one",
                choices: [
                    { name: "rest", value: "rest" },
                    { name: "grpc", value: "grpc" }
                ],
                nonInteractiveError: "error"
            });

            expect(result).toBe("grpc");
        });

        it("calls inquirer.prompt with a list question containing all choices", async () => {
            const inquirer = await import("inquirer");
            vi.mocked(inquirer.default.prompt).mockResolvedValue({ selected: "rest" });

            await promptSelect({
                isTTY: true,
                message: "Multiple APIs found. Select one:",
                choices: [
                    { name: "rest", value: "rest" },
                    { name: "grpc", value: "grpc" }
                ],
                nonInteractiveError: "error"
            });

            expect(inquirer.default.prompt).toHaveBeenCalledOnce();
            const [questions] = vi.mocked(inquirer.default.prompt).mock.calls[0] ?? [];
            const question = Array.isArray(questions) ? questions[0] : questions;
            expect(question).toMatchObject({
                type: "list",
                message: "Multiple APIs found. Select one:",
                name: "selected"
            });
            const choiceValues = question.choices.map((c: { value: unknown }) => c.value);
            expect(choiceValues).toEqual(["rest", "grpc"]);
        });

        it("annotates choice labels with flagHint when provided", async () => {
            const inquirer = await import("inquirer");
            vi.mocked(inquirer.default.prompt).mockResolvedValue({ selected: "rest" });

            await promptSelect({
                isTTY: true,
                message: "Pick one",
                choices: [
                    { name: "rest", value: "rest" },
                    { name: "grpc", value: "grpc" }
                ],
                nonInteractiveError: "error",
                flagHint: (value) => `--api ${value}`
            });

            const [questions] = vi.mocked(inquirer.default.prompt).mock.calls[0] ?? [];
            const question = Array.isArray(questions) ? questions[0] : questions;
            const choiceNames: string[] = question.choices.map((c: { name: string }) => c.name);
            expect(choiceNames[0]).toContain("rest");
            expect(choiceNames[0]).toContain("--api rest");
            expect(choiceNames[1]).toContain("grpc");
            expect(choiceNames[1]).toContain("--api grpc");
        });

        it("returns the selected value for non-string generics", async () => {
            const inquirer = await import("inquirer");
            vi.mocked(inquirer.default.prompt).mockResolvedValue({ selected: undefined });

            const result = await promptSelect<string | undefined>({
                isTTY: true,
                message: "Pick a group",
                choices: [
                    { name: "all (3 targets)", value: undefined },
                    { name: "production", value: "production" },
                    { name: "staging", value: "staging" }
                ],
                nonInteractiveError: "error"
            });

            expect(result).toBeUndefined();
        });
    });
});
