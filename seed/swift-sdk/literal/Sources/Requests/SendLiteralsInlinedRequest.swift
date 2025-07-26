public struct SendLiteralsInlinedRequest: Codable, Hashable, Sendable {
    public let prompt: Any
    public let context: Any?
    public let query: String
    public let temperature: Double?
    public let stream: Any
    public let aliasedContext: SomeAliasedLiteral
    public let maybeContext: SomeAliasedLiteral?
    public let objectWithLiteral: ATopLevelLiteral
    public let additionalProperties: [String: JSONValue]

    public init(
        prompt: Any,
        context: Any? = nil,
        query: String,
        temperature: Double? = nil,
        stream: Any,
        aliasedContext: SomeAliasedLiteral,
        maybeContext: SomeAliasedLiteral? = nil,
        objectWithLiteral: ATopLevelLiteral,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.prompt = prompt
        self.context = context
        self.query = query
        self.temperature = temperature
        self.stream = stream
        self.aliasedContext = aliasedContext
        self.maybeContext = maybeContext
        self.objectWithLiteral = objectWithLiteral
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.prompt = try container.decode(Any.self, forKey: .prompt)
        self.context = try container.decodeIfPresent(Any.self, forKey: .context)
        self.query = try container.decode(String.self, forKey: .query)
        self.temperature = try container.decodeIfPresent(Double.self, forKey: .temperature)
        self.stream = try container.decode(Any.self, forKey: .stream)
        self.aliasedContext = try container.decode(SomeAliasedLiteral.self, forKey: .aliasedContext)
        self.maybeContext = try container.decodeIfPresent(SomeAliasedLiteral.self, forKey: .maybeContext)
        self.objectWithLiteral = try container.decode(ATopLevelLiteral.self, forKey: .objectWithLiteral)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.prompt, forKey: .prompt)
        try container.encodeIfPresent(self.context, forKey: .context)
        try container.encode(self.query, forKey: .query)
        try container.encodeIfPresent(self.temperature, forKey: .temperature)
        try container.encode(self.stream, forKey: .stream)
        try container.encode(self.aliasedContext, forKey: .aliasedContext)
        try container.encodeIfPresent(self.maybeContext, forKey: .maybeContext)
        try container.encode(self.objectWithLiteral, forKey: .objectWithLiteral)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case prompt
        case context
        case query
        case temperature
        case stream
        case aliasedContext
        case maybeContext
        case objectWithLiteral
    }
}