public struct BaseResource: Codable, Hashable {
    public let id: String
    public let relatedResources: [ResourceList]
    public let memo: Memo

    enum CodingKeys: String, CodingKey {
        case id
        case relatedResources = "related_resources"
        case memo
    }
}