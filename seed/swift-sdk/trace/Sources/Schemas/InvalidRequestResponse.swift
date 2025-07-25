public struct InvalidRequestResponse: Codable, Hashable {
    public let request: SubmissionRequest
    public let cause: InvalidRequestCause
    public let additionalProperties: [String: JSONValue]

    public init(
        request: SubmissionRequest,
        cause: InvalidRequestCause,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.request = request
        self.cause = cause
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.request = try container.decode(SubmissionRequest.self, forKey: .request)
        self.cause = try container.decode(InvalidRequestCause.self, forKey: .cause)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.request, forKey: .request)
        try container.encode(self.cause, forKey: .cause)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case request
        case cause
    }
}