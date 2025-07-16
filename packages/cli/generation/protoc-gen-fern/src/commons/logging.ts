import { LogLevel } from '@fern-api/logger'

export class Logger {
    private enabled = true

    private write(level: string, ...messages: string[]): void {
        if (!this.enabled) {
            return
        }
        process.stderr.write(`[${level}] ${messages.join(' ')}\n`)
    }

    disable(): void {
        this.enabled = false
    }

    enable(): void {
        this.enabled = true
    }

    trace(...args: string[]): void {
        this.write(LogLevel.Trace, ...args)
    }

    debug(...args: string[]): void {
        this.write(LogLevel.Debug, ...args)
    }

    info(...args: string[]): void {
        this.write(LogLevel.Info, ...args)
    }

    warn(...args: string[]): void {
        this.write(LogLevel.Warn, ...args)
    }

    error(...args: string[]): void {
        this.write(LogLevel.Error, ...args)
    }

    log(level: LogLevel, ...args: string[]): void {
        this.write(level, ...args)
    }
}
