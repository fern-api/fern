public struct SendRequest: Codable, Hashable, Sendable {
    public let prompt: Any
    public let query: String
    public let stream: Any
    public let ending: Any
    public let context: SomeLiteral
    public let maybeContext: SomeLiteral?
    public let containerObject: ContainerObject
    public let additionalProperties: [String: JSONValue]

    public init(
        prompt: Any,
        query: String,
        stream: Any,
        ending: Any,
        context: SomeLiteral,
        maybeContext: SomeLiteral? = nil,
        containerObject: ContainerObject,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.prompt = prompt
        self.query = query
        self.stream = stream
        self.ending = ending
        self.context = context
        self.maybeContext = maybeContext
        self.containerObject = containerObject
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.prompt = try container.decode(Any.self, forKey: .prompt)
        self.query = try container.decode(String.self, forKey: .query)
        self.stream = try container.decode(Any.self, forKey: .stream)
        self.ending = try container.decode(Any.self, forKey: .ending)
        self.context = try container.decode(SomeLiteral.self, forKey: .context)
        self.maybeContext = try container.decodeIfPresent(SomeLiteral.self, forKey: .maybeContext)
        self.containerObject = try container.decode(ContainerObject.self, forKey: .containerObject)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.prompt, forKey: .prompt)
        try container.encode(self.query, forKey: .query)
        try container.encode(self.stream, forKey: .stream)
        try container.encode(self.ending, forKey: .ending)
        try container.encode(self.context, forKey: .context)
        try container.encodeIfPresent(self.maybeContext, forKey: .maybeContext)
        try container.encode(self.containerObject, forKey: .containerObject)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case prompt
        case query
        case stream
        case ending
        case context
        case maybeContext
        case containerObject
    }
}