public enum MultipleFilterSearchRequestValue: Codable, Hashable, Sendable {
    case multipleFilterSearchRequestArray([MultipleFilterSearchRequest])
    case singleFilterSearchRequestArray([SingleFilterSearchRequest])

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}