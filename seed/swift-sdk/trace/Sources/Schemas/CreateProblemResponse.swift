public enum CreateProblemResponse: Codable, Hashable, Sendable {
    case success(Success)
    case error(Error)

    public struct Success: Codable, Hashable, Sendable {
        public let value: ProblemId

        public init(value: ProblemId) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Error: Codable, Hashable, Sendable {
        public let value: CreateProblemError

        public init(value: CreateProblemError) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}