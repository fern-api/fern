public enum NetworkResponse {
    case success(String)
    case error(Int, String)

    public init(successValue value: String) {
        self = .success(value)
    }

    public init?(from dictionary: [String: Any]) {
        if let value = dictionary["success"] as? String {
            self = .success(value)
        } else if let code = dictionary["errorCode"] as? Int,
                  let message = dictionary["errorMessage"] as? String {
            self = .error(code, message)
        } else {
            return nil
        }
    }
}