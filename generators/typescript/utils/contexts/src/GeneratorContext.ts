import { Logger } from "@fern-api/logger"

export interface GeneratorContext {
    logger: Logger
    version: string | undefined
    fail: () => void
}
