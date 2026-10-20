import { Logger } from "@fern-api/logger";
import { Mock, vi } from "vitest";

export type MockLogger = { [Method in keyof Logger]: Mock<Logger[Method]> };

export function createMockLogger(): MockLogger {
    return {
        disable: vi.fn<Logger["disable"]>(),
        enable: vi.fn<Logger["enable"]>(),
        trace: vi.fn<Logger["trace"]>(),
        debug: vi.fn<Logger["debug"]>(),
        info: vi.fn<Logger["info"]>(),
        warn: vi.fn<Logger["warn"]>(),
        error: vi.fn<Logger["error"]>(),
        log: vi.fn<Logger["log"]>()
    };
}

/** The first argument of every call made to the given mock logger method. */
export function loggedMessages(method: Mock<(...args: string[]) => void>): string[] {
    return method.mock.calls.map((call) => String(call[0]));
}
