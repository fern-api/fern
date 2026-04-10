import Foundation

public enum WorkspaceSubmissionUpdateInfo: Codable, Hashable, Sendable {
    case workspaceSubmissionUpdateInfoFive(WorkspaceSubmissionUpdateInfoFive)
    case workspaceSubmissionUpdateInfoFour(WorkspaceSubmissionUpdateInfoFour)
    case workspaceSubmissionUpdateInfoOne(WorkspaceSubmissionUpdateInfoOne)
    case workspaceSubmissionUpdateInfoThree(WorkspaceSubmissionUpdateInfoThree)
    case workspaceSubmissionUpdateInfoTwo(WorkspaceSubmissionUpdateInfoTwo)
    case workspaceSubmissionUpdateInfoType(WorkspaceSubmissionUpdateInfoType)
    case workspaceSubmissionUpdateInfoZero(WorkspaceSubmissionUpdateInfoZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(WorkspaceSubmissionUpdateInfoFive.self) {
            self = .workspaceSubmissionUpdateInfoFive(value)
        } else if let value = try? container.decode(WorkspaceSubmissionUpdateInfoFour.self) {
            self = .workspaceSubmissionUpdateInfoFour(value)
        } else if let value = try? container.decode(WorkspaceSubmissionUpdateInfoOne.self) {
            self = .workspaceSubmissionUpdateInfoOne(value)
        } else if let value = try? container.decode(WorkspaceSubmissionUpdateInfoThree.self) {
            self = .workspaceSubmissionUpdateInfoThree(value)
        } else if let value = try? container.decode(WorkspaceSubmissionUpdateInfoTwo.self) {
            self = .workspaceSubmissionUpdateInfoTwo(value)
        } else if let value = try? container.decode(WorkspaceSubmissionUpdateInfoType.self) {
            self = .workspaceSubmissionUpdateInfoType(value)
        } else if let value = try? container.decode(WorkspaceSubmissionUpdateInfoZero.self) {
            self = .workspaceSubmissionUpdateInfoZero(value)
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
        case .workspaceSubmissionUpdateInfoFive(let value):
            try container.encode(value)
        case .workspaceSubmissionUpdateInfoFour(let value):
            try container.encode(value)
        case .workspaceSubmissionUpdateInfoOne(let value):
            try container.encode(value)
        case .workspaceSubmissionUpdateInfoThree(let value):
            try container.encode(value)
        case .workspaceSubmissionUpdateInfoTwo(let value):
            try container.encode(value)
        case .workspaceSubmissionUpdateInfoType(let value):
            try container.encode(value)
        case .workspaceSubmissionUpdateInfoZero(let value):
            try container.encode(value)
        }
    }
}