struct Order {
    let id: Int64
    let petId: String

    enum Status: String, Codable, CaseIterable {
        case available
        case pending
    }
}