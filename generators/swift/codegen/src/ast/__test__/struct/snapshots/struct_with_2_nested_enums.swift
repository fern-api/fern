struct Pet {
    let id: Int
    let name: String

    enum Status: String, Codable, CaseIterable {
        case available
        case pending
    }

    enum CodingKeys: String, CodingKey {
        case id
        case name
    }
}