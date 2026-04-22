import Foundation

public enum SubmissionStatusV2: Codable, Hashable, Sendable {
    case test(TestSubmissionStatusV2)
    case workspace(WorkspaceSubmissionStatusV2)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "test":
            self = .test(try TestSubmissionStatusV2(from: decoder))
        case "workspace":
            self = .workspace(try WorkspaceSubmissionStatusV2(from: decoder))
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
        case .test(let data):
            try container.encode("test", forKey: .type)
            try data.encode(to: encoder)
        case .workspace(let data):
            try container.encode("workspace", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}