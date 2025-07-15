public struct ReceiveSnakeCase: Codable, Hashable {
    public let receiveText: String
    public let receiveInt: Int

    enum CodingKeys: String, CodingKey {
        case receiveText = "receive_text"
        case receiveInt = "receive_int"
    }
}