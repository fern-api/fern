public enum APIResponse: Codable {
    case success(Data)
    case error(ErrorInfo)

    public struct Data: Codable {
        let id: String
        let value: String
    }

    public struct ErrorInfo: Codable {
        let code: Int
        let message: String
    }
}