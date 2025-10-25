import Foundation

public struct BigEntity: Codable, Hashable, Sendable {
    public let castMember: CastMember?
    public let extendedMovie: ExtendedMovie?
    public let entity: Entity?
    public let metadata: MetadataType?
    public let commonMetadata: Metadata?
    public let eventInfo: EventInfo?
    public let data: Data?
    public let migration: Migration?
    public let exception: Exception?
    public let test: Test?
    public let node: Node?
    public let directory: Directory?
    public let moment: Moment?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        castMember: CastMember? = nil,
        extendedMovie: ExtendedMovie? = nil,
        entity: Entity? = nil,
        metadata: MetadataType? = nil,
        commonMetadata: Metadata? = nil,
        eventInfo: EventInfo? = nil,
        data: Data? = nil,
        migration: Migration? = nil,
        exception: Exception? = nil,
        test: Test? = nil,
        node: Node? = nil,
        directory: Directory? = nil,
        moment: Moment? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.castMember = castMember
        self.extendedMovie = extendedMovie
        self.entity = entity
        self.metadata = metadata
        self.commonMetadata = commonMetadata
        self.eventInfo = eventInfo
        self.data = data
        self.migration = migration
        self.exception = exception
        self.test = test
        self.node = node
        self.directory = directory
        self.moment = moment
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.castMember = try container.decodeIfPresent(CastMember.self, forKey: .castMember)
        self.extendedMovie = try container.decodeIfPresent(ExtendedMovie.self, forKey: .extendedMovie)
        self.entity = try container.decodeIfPresent(Entity.self, forKey: .entity)
        self.metadata = try container.decodeIfPresent(MetadataType.self, forKey: .metadata)
        self.commonMetadata = try container.decodeIfPresent(Metadata.self, forKey: .commonMetadata)
        self.eventInfo = try container.decodeIfPresent(EventInfo.self, forKey: .eventInfo)
        self.data = try container.decodeIfPresent(Data.self, forKey: .data)
        self.migration = try container.decodeIfPresent(Migration.self, forKey: .migration)
        self.exception = try container.decodeIfPresent(Exception.self, forKey: .exception)
        self.test = try container.decodeIfPresent(Test.self, forKey: .test)
        self.node = try container.decodeIfPresent(Node.self, forKey: .node)
        self.directory = try container.decodeIfPresent(Directory.self, forKey: .directory)
        self.moment = try container.decodeIfPresent(Moment.self, forKey: .moment)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.castMember, forKey: .castMember)
        try container.encodeIfPresent(self.extendedMovie, forKey: .extendedMovie)
        try container.encodeIfPresent(self.entity, forKey: .entity)
        try container.encodeIfPresent(self.metadata, forKey: .metadata)
        try container.encodeIfPresent(self.commonMetadata, forKey: .commonMetadata)
        try container.encodeIfPresent(self.eventInfo, forKey: .eventInfo)
        try container.encodeIfPresent(self.data, forKey: .data)
        try container.encodeIfPresent(self.migration, forKey: .migration)
        try container.encodeIfPresent(self.exception, forKey: .exception)
        try container.encodeIfPresent(self.test, forKey: .test)
        try container.encodeIfPresent(self.node, forKey: .node)
        try container.encodeIfPresent(self.directory, forKey: .directory)
        try container.encodeIfPresent(self.moment, forKey: .moment)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case castMember
        case extendedMovie
        case entity
        case metadata
        case commonMetadata
        case eventInfo
        case data
        case migration
        case exception
        case test
        case node
        case directory
        case moment
    }
}