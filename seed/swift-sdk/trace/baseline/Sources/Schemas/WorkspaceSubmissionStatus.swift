import Foundation

public enum WorkspaceSubmissionStatus: Codable, Hashable, Sendable {
    case errored(ErrorInfo)
    case ran(WorkspaceRunDetails)
    case running(RunningSubmissionState)
    case stopped
    case traced(WorkspaceRunDetails)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "errored":
            self = .errored(try container.decode(ErrorInfo.self, forKey: .value))
        case "ran":
            self = .ran(try WorkspaceRunDetails(from: decoder))
        case "running":
            self = .running(try container.decode(RunningSubmissionState.self, forKey: .value))
        case "stopped":
            self = .stopped
        case "traced":
            self = .traced(try WorkspaceRunDetails(from: decoder))
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
        case .errored(let data):
            try container.encode("errored", forKey: .type)
            try container.encode(data, forKey: .value)
        case .ran(let data):
            try container.encode("ran", forKey: .type)
            try data.encode(to: encoder)
        case .running(let data):
            try container.encode("running", forKey: .type)
            try container.encode(data, forKey: .value)
        case .stopped:
            try container.encode("stopped", forKey: .type)
        case .traced(let data):
            try container.encode("traced", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}