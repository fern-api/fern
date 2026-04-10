import Foundation

public struct WorkspaceSubmissionStatusFour: Codable, Hashable, Sendable {
    public let exceptionV2: ExceptionV2?
    public let exception: ExceptionInfo?
    public let stdout: String
    public let type: WorkspaceSubmissionStatusFourType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        exceptionV2: ExceptionV2? = nil,
        exception: ExceptionInfo? = nil,
        stdout: String,
        type: WorkspaceSubmissionStatusFourType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.exceptionV2 = exceptionV2
        self.exception = exception
        self.stdout = stdout
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.exceptionV2 = try container.decodeIfPresent(ExceptionV2.self, forKey: .exceptionV2)
        self.exception = try container.decodeIfPresent(ExceptionInfo.self, forKey: .exception)
        self.stdout = try container.decode(String.self, forKey: .stdout)
        self.type = try container.decode(WorkspaceSubmissionStatusFourType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.exceptionV2, forKey: .exceptionV2)
        try container.encodeIfPresent(self.exception, forKey: .exception)
        try container.encode(self.stdout, forKey: .stdout)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case exceptionV2
        case exception
        case stdout
        case type
    }
}