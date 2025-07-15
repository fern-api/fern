public struct MultipleFilterSearchRequest: Codable, Hashable {
    public let `operator`: MultipleFilterSearchRequestOperator?
    public let value: MultipleFilterSearchRequestValue?
}