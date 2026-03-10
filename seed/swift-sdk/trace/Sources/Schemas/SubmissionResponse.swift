import Foundation

public enum SubmissionResponse: Codable, Hashable, Sendable {
    case codeExecutionUpdate(CodeExecutionUpdate)
    case problemInitialized(ProblemId)
    case serverErrored(ExceptionInfo)
    case serverInitialized
    case terminated(TerminatedResponse)
    case workspaceInitialized

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "codeExecutionUpdate":
            self = .codeExecutionUpdate(try container.decode(CodeExecutionUpdate.self, forKey: .value))
        case "problemInitialized":
            self = .problemInitialized(try container.decode(ProblemId.self, forKey: .value))
        case "serverErrored":
            self = .serverErrored(try ExceptionInfo(from: decoder))
        case "serverInitialized":
            self = .serverInitialized
        case "terminated":
            self = .terminated(try TerminatedResponse(from: decoder))
        case "workspaceInitialized":
            self = .workspaceInitialized
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
        case .codeExecutionUpdate(let data):
            try container.encode("codeExecutionUpdate", forKey: .type)
            try container.encode(data, forKey: .value)
        case .problemInitialized(let data):
            try container.encode("problemInitialized", forKey: .type)
            try container.encode(data, forKey: .value)
        case .serverErrored(let data):
            try container.encode("serverErrored", forKey: .type)
            try data.encode(to: encoder)
        case .serverInitialized:
            try container.encode("serverInitialized", forKey: .type)
        case .terminated(let data):
            try container.encode("terminated", forKey: .type)
            try data.encode(to: encoder)
        case .workspaceInitialized:
            try container.encode("workspaceInitialized", forKey: .type)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}