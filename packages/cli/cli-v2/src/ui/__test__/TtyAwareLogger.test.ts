import { Writable } from "stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Paintable, TtyAwareLogger } from "../TtyAwareLogger.js";

vi.mock("is-ci", () => ({ default: false }));

function createStream({ isTTY }: { isTTY: boolean }): {
    stream: NodeJS.WriteStream;
    output: () => string;
    drain: () => string;
} {
    const chunks: string[] = [];
    const stream = Object.assign(
        new Writable({
            write(chunk, _encoding, callback) {
                chunks.push(Buffer.from(chunk).toString("utf-8"));
                callback();
            }
        }),
        { isTTY, columns: 80, rows: 24 }
    ) as unknown as NodeJS.WriteStream;
    return {
        stream,
        output: () => chunks.join(""),
        drain: () => chunks.splice(0, chunks.length).join("")
    };
}

function paintable(text: string): Paintable {
    return { paint: () => text };
}

describe("TtyAwareLogger", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("isTTY", () => {
        it("is true when stdout.isTTY and not CI", () => {
            const stdout = createStream({ isTTY: true });
            const stderr = createStream({ isTTY: true });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);
            expect(logger.isTTY).toBe(true);
        });

        it("is false when stdout.isTTY is false", () => {
            const stdout = createStream({ isTTY: false });
            const stderr = createStream({ isTTY: false });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);
            expect(logger.isTTY).toBe(false);
        });
    });

    describe("write", () => {
        it("writes content verbatim on non-TTY stdout", () => {
            const stdout = createStream({ isTTY: false });
            const stderr = createStream({ isTTY: false });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);

            logger.write("hello\n");

            expect(stdout.output()).toBe("hello\n");
        });

        it("writes to stderr when stderr option is set", () => {
            const stdout = createStream({ isTTY: false });
            const stderr = createStream({ isTTY: false });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);

            logger.write("oops\n", { stderr: true });

            expect(stderr.output()).toBe("oops\n");
            expect(stdout.output()).toBe("");
        });

        it("brackets TTY writes with clear + repaint of registered paintables", () => {
            const stdout = createStream({ isTTY: true });
            const stderr = createStream({ isTTY: true });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);

            logger.register(paintable("TASKS"));

            // Drain any content emitted during registration.
            stdout.drain();

            logger.write("log line\n");

            const out = stdout.drain();
            expect(out).toContain("log line\n");
            expect(out).toContain("TASKS");
        });
    });

    describe("register", () => {
        it("does not start a paint loop on non-TTY streams", () => {
            const stdout = createStream({ isTTY: false });
            const stderr = createStream({ isTTY: false });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);

            logger.register(paintable("HIDDEN"));
            vi.advanceTimersByTime(500);

            expect(stdout.output()).toBe("");
        });

        it("renders the paintable immediately on registration for TTY streams", () => {
            const stdout = createStream({ isTTY: true });
            const stderr = createStream({ isTTY: true });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);

            logger.register(paintable("VISIBLE"));

            expect(stdout.output()).toContain("VISIBLE");
        });
    });

    describe("takeOverTerminal", () => {
        it("runs the callback once and flushes buffered writes afterwards", async () => {
            const stdout = createStream({ isTTY: true });
            const stderr = createStream({ isTTY: true });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);

            logger.register(paintable("TASKS"));
            stdout.drain();

            let ran = 0;
            await logger.takeOverTerminal(() => {
                ran++;
                logger.write("queued\n");
            });

            expect(ran).toBe(1);
            expect(stdout.drain()).toContain("queued\n");
        });

        it("awaits async callbacks before resuming", async () => {
            const stdout = createStream({ isTTY: true });
            const stderr = createStream({ isTTY: true });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);

            let resolved = false;
            const promise = logger.takeOverTerminal(async () => {
                await Promise.resolve();
                resolved = true;
            });

            await promise;
            expect(resolved).toBe(true);
        });

        it("flushes stderr writes to stderr, not stdout", async () => {
            const stdout = createStream({ isTTY: true });
            const stderr = createStream({ isTTY: true });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);

            logger.register(paintable("TASKS"));
            stdout.drain();
            stderr.drain();

            await logger.takeOverTerminal(() => {
                logger.write("err line\n", { stderr: true });
            });

            expect(stderr.drain()).toContain("err line\n");
            expect(stdout.drain()).not.toContain("err line\n");
        });
    });

    describe("multiple paintables", () => {
        it("renders all registered paintables on the next repaint", () => {
            const stdout = createStream({ isTTY: true });
            const stderr = createStream({ isTTY: true });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);

            logger.register(paintable("FIRST"));
            logger.register(paintable("SECOND"));

            // Advance one tick so the interval fires and repaints with both paintables.
            vi.advanceTimersByTime(100);

            const out = stdout.output();
            expect(out).toContain("FIRST");
            expect(out).toContain("SECOND");
        });
    });

    describe("spinner frame", () => {
        it("passes a different frame to paintables as time advances", () => {
            const stdout = createStream({ isTTY: true });
            const stderr = createStream({ isTTY: true });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);

            const frames: string[] = [];
            const trackingPaintable: Paintable = {
                paint(frame) {
                    frames.push(frame);
                    return `frame:${frame}`;
                }
            };

            logger.register(trackingPaintable);
            stdout.drain();

            vi.advanceTimersByTime(300);

            // Three additional repaints should have fired (100ms each).
            expect(frames.length).toBeGreaterThanOrEqual(3);
            // Not all frames should be the same spinner character.
            const unique = new Set(frames);
            expect(unique.size).toBeGreaterThan(1);
        });
    });

    describe("finish", () => {
        it("is a no-op on non-TTY streams", () => {
            const stdout = createStream({ isTTY: false });
            const stderr = createStream({ isTTY: false });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);

            logger.register(paintable("X"));
            logger.finish();

            expect(stdout.output()).toBe("");
        });

        it("stops the paint loop so later writes do not repaint", () => {
            const stdout = createStream({ isTTY: true });
            const stderr = createStream({ isTTY: true });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);

            logger.register(paintable("ACTIVE"));
            logger.finish();

            stdout.drain();
            vi.advanceTimersByTime(1000);

            // After finish the interval is cleared; no further repaints happen.
            expect(stdout.drain()).toBe("");
        });

        it("is idempotent — cursorShow is written exactly once", () => {
            const stdout = createStream({ isTTY: true });
            const stderr = createStream({ isTTY: true });
            const logger = new TtyAwareLogger(stdout.stream, stderr.stream);

            logger.register(paintable("X"));
            logger.finish();
            const afterFirst = stdout.drain();
            logger.finish();
            const afterSecond = stdout.drain();

            // First finish writes the final paint + cursorShow.
            expect(afterFirst).toBeTruthy();
            // Second finish must be a no-op.
            expect(afterSecond).toBe("");
        });
    });
});
