import { PosthogEvent } from "@fern-api/task-context"

export interface PosthogManager {
    sendEvent(event: PosthogEvent): void
    identify(): void
    flush(): Promise<void>
}
