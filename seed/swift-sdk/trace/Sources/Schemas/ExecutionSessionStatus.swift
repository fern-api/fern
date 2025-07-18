public enum ExecutionSessionStatus: String, Codable, Hashable, Sendable, CaseIterable {
    case creatingContainer = "CREATING_CONTAINER"
    case provisioningContainer = "PROVISIONING_CONTAINER"
    case pendingContainer = "PENDING_CONTAINER"
    case runningContainer = "RUNNING_CONTAINER"
    case liveContainer = "LIVE_CONTAINER"
    case failedToLaunch = "FAILED_TO_LAUNCH"
}