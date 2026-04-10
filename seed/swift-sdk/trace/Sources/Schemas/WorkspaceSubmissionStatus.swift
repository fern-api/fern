import Foundation

public enum WorkspaceSubmissionStatus: Codable, Hashable, Sendable {
    case workspaceSubmissionStatusFour(WorkspaceSubmissionStatusFour)
    case workspaceSubmissionStatusOne(WorkspaceSubmissionStatusOne)
    case workspaceSubmissionStatusThree(WorkspaceSubmissionStatusThree)
    case workspaceSubmissionStatusType(WorkspaceSubmissionStatusType)
    case workspaceSubmissionStatusZero(WorkspaceSubmissionStatusZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(WorkspaceSubmissionStatusFour.self) {
            self = .workspaceSubmissionStatusFour(value)
        } else if let value = try? container.decode(WorkspaceSubmissionStatusOne.self) {
            self = .workspaceSubmissionStatusOne(value)
        } else if let value = try? container.decode(WorkspaceSubmissionStatusThree.self) {
            self = .workspaceSubmissionStatusThree(value)
        } else if let value = try? container.decode(WorkspaceSubmissionStatusType.self) {
            self = .workspaceSubmissionStatusType(value)
        } else if let value = try? container.decode(WorkspaceSubmissionStatusZero.self) {
            self = .workspaceSubmissionStatusZero(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .workspaceSubmissionStatusFour(let value):
            try container.encode(value)
        case .workspaceSubmissionStatusOne(let value):
            try container.encode(value)
        case .workspaceSubmissionStatusThree(let value):
            try container.encode(value)
        case .workspaceSubmissionStatusType(let value):
            try container.encode(value)
        case .workspaceSubmissionStatusZero(let value):
            try container.encode(value)
        }
    }
}