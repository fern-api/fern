public struct SendSnakeCase: Codable, Hashable {
    public let sendText: String
    public let sendParam: Int

    enum CodingKeys: String, CodingKey {
        case sendText = "send_text"
        case sendParam = "send_param"
    }
}