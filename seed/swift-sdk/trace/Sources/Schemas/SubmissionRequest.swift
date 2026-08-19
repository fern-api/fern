import Foundation

public enum SubmissionRequest: Codable, Hashable, Sendable {
    case initializeProblemRequest(InitializeProblemRequest)
    case initializeWorkspaceRequest
    case stop(StopRequest)
    case submitV2(SubmitRequestV2)
    case workspaceSubmit(WorkspaceSubmitRequest)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "initializeProblemRequest":
            self = .initializeProblemRequest(try InitializeProblemRequest(from: decoder))
        case "initializeWorkspaceRequest":
            self = .initializeWorkspaceRequest
        case "stop":
            self = .stop(try StopRequest(from: decoder))
        case "submitV2":
            self = .submitV2(try SubmitRequestV2(from: decoder))
        case "workspaceSubmit":
            self = .workspaceSubmit(try WorkspaceSubmitRequest(from: decoder))
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
        case .initializeProblemRequest(let data):
            try container.encode("initializeProblemRequest", forKey: .type)
            try data.encode(to: encoder)
        case .initializeWorkspaceRequest:
            try container.encode("initializeWorkspaceRequest", forKey: .type)
        case .stop(let data):
            try container.encode("stop", forKey: .type)
            try data.encode(to: encoder)
        case .submitV2(let data):
            try container.encode("submitV2", forKey: .type)
            try data.encode(to: encoder)
        case .workspaceSubmit(let data):
            try container.encode("workspaceSubmit", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}