import Foundation

public enum CodeExecutionUpdate: Codable, Hashable, Sendable {
    /// Statuses if an executor for the session isn't ready (Before RunningResponse).
    case buildingExecutor(BuildingExecutorResponse)
    /// Sent if a submission cannot be run (i.e. Compile Error).
    case errored(ErroredResponse)
    /// Sent once a submission is graded and fully recorded.
    case finished(FinishedResponse)
    /// Graded testcases without trace information.
    case graded(GradedResponse)
    /// Graded submission for v2 problems.
    case gradedV2(GradedResponseV2)
    /// Sent if an invalid request is sent for a submission.
    case invalidRequest(InvalidRequestResponse)
    /// Graded testcases with trace information.
    case recorded(RecordedResponseNotification)
    /// Gives progress about what is being recorded.
    case recording(RecordingResponseNotification)
    /// Sent once a test submission is executing.
    case running(RunningResponse)
    /// Sent if a submission is stopped.
    case stopped(StoppedResponse)
    /// Workspace run without trace information.
    case workspaceRan(WorkspaceRanResponse)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "buildingExecutor":
            self = .buildingExecutor(try BuildingExecutorResponse(from: decoder))
        case "errored":
            self = .errored(try ErroredResponse(from: decoder))
        case "finished":
            self = .finished(try FinishedResponse(from: decoder))
        case "graded":
            self = .graded(try GradedResponse(from: decoder))
        case "gradedV2":
            self = .gradedV2(try GradedResponseV2(from: decoder))
        case "invalidRequest":
            self = .invalidRequest(try InvalidRequestResponse(from: decoder))
        case "recorded":
            self = .recorded(try RecordedResponseNotification(from: decoder))
        case "recording":
            self = .recording(try RecordingResponseNotification(from: decoder))
        case "running":
            self = .running(try RunningResponse(from: decoder))
        case "stopped":
            self = .stopped(try StoppedResponse(from: decoder))
        case "workspaceRan":
            self = .workspaceRan(try WorkspaceRanResponse(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .buildingExecutor(let data):
            try container.encode("buildingExecutor", forKey: .type)
            try data.encode(to: encoder)
        case .errored(let data):
            try container.encode("errored", forKey: .type)
            try data.encode(to: encoder)
        case .finished(let data):
            try container.encode("finished", forKey: .type)
            try data.encode(to: encoder)
        case .graded(let data):
            try container.encode("graded", forKey: .type)
            try data.encode(to: encoder)
        case .gradedV2(let data):
            try container.encode("gradedV2", forKey: .type)
            try data.encode(to: encoder)
        case .invalidRequest(let data):
            try container.encode("invalidRequest", forKey: .type)
            try data.encode(to: encoder)
        case .recorded(let data):
            try container.encode("recorded", forKey: .type)
            try data.encode(to: encoder)
        case .recording(let data):
            try container.encode("recording", forKey: .type)
            try data.encode(to: encoder)
        case .running(let data):
            try container.encode("running", forKey: .type)
            try data.encode(to: encoder)
        case .stopped(let data):
            try container.encode("stopped", forKey: .type)
            try data.encode(to: encoder)
        case .workspaceRan(let data):
            try container.encode("workspaceRan", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}