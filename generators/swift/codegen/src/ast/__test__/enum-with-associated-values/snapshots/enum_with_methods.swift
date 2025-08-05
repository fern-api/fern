public enum Result: Equatable {
    case success(String)
    case failure(String)

    public func isSuccess() -> Bool {
        switch self {
        case .success:
            return true
        case .failure:
            return false
        }
    }

    public func getValue() -> String? {
        switch self {
        case .success(let value):
            return value
        case .failure:
            return nil
        }
    }
}