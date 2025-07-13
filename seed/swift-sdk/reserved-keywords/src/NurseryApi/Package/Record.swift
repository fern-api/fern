public struct Record: Codable, Hashable {
    public let foo: Any
    public let 3D: Int

    enum CodingKeys: String, CodingKey {
        case foo
        case 3D = "3d"
    }
}