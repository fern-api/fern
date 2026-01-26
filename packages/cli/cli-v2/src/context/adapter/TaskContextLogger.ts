import { Logger, LogLevel } from "@fern-api/logger";
import chalk from "chalk";

/** Color wheel for badge prefixes - cycles through these colors for each task. */
const BADGE_COLORS = ["#2E86AB", "#A23B72", "#F18F01", "#C73E1D", "#CCE2A3"];

/**
 * A logger that adapts the behavior of the original TaskContext logger.
 * This removes noisy output from the legacy CLI, but retains some of the
 * useful features (e.g. colored badges).
 */
export class TaskContextLogger implements Logger {
    private static badgeCounter = 0;

    private readonly collectedErrors: string[] = [];

    private readonly logger: Logger;
    private readonly logLevel: LogLevel;
    private readonly badge: string | undefined;
    private readonly badgeColor: string | undefined;

    private enabled: boolean = true;

    constructor({ logger, logLevel, badge }: { logger: Logger; logLevel: LogLevel; badge?: string }) {
        this.logger = logger;
        this.logLevel = logLevel;
        this.badge = badge;
        if (badge != null) {
            this.badgeColor = BADGE_COLORS[TaskContextLogger.badgeCounter++ % BADGE_COLORS.length];
        }
    }

    public disable(): void {
        this.enabled = false;
    }

    public enable(): void {
        this.enabled = true;
    }

    public trace(...args: string[]): void {
        if (this.enabled && this.logLevel <= LogLevel.Trace) {
            this.logger.trace(...this.prefix(args));
        }
    }

    public debug(...args: string[]): void {
        if (this.enabled && this.logLevel <= LogLevel.Debug) {
            this.logger.debug(...this.prefix(args));
        }
    }

    public info(...args: string[]): void {
        // Info logs are noisy in the legacy CLI, so we only include them in debug mode for now.
        if (this.enabled && this.logLevel <= LogLevel.Debug) {
            this.logger.info(...this.prefix(args));
        }
    }

    public warn(...args: string[]): void {
        if (this.enabled) {
            this.logger.warn(...this.prefix(args));
        }
    }

    public error(...args: string[]): void {
        if (this.enabled) {
            this.collectedErrors.push(args.join(" "));
            this.logger.error(...this.prefix(args));
        }
    }

    public log(level: LogLevel, ...args: string[]): void {
        if (level === LogLevel.Warn || level === LogLevel.Error) {
            this.collectedErrors.push(args.join(" "));
            const prefixed = this.prefix(args);
            if (level === LogLevel.Warn) {
                this.logger.warn(...prefixed);
            }
            if (level === LogLevel.Error) {
                this.logger.error(...prefixed);
            }
        }
    }

    /**
     * Get the first collected error message, if any.
     */
    public getFirstError(): string | undefined {
        return this.collectedErrors[0];
    }

    private prefix(args: string[]): string[] {
        if (this.badge == null) {
            return args;
        }
        const [first, ...rest] = args;
        const coloredBadge =
            this.badgeColor != null ? chalk.hex(this.badgeColor)(`[${this.badge}]:`) : `[${this.badge}]:`;
        return [`${coloredBadge} ${first ?? ""}`, ...rest];
    }
}
