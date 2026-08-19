public enum CompleteEnum: Codable, Equatable {
    case loading(Progress)
    case loaded(Content)
    case failed(ErrorDetails)

    public init(content: Content) {
        self = .loaded(content)
    }

    public func isLoading() -> Bool {
        if case .loading = self { return true }
        return false
    }

    public struct Progress: Codable {
        let percentage: Double
    }
}