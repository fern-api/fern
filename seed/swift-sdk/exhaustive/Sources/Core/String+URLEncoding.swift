import Foundation

extension Swift.String {
    func urlPathEncoded() -> Swift.String {
        return self.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? self
    }

    func urlQueryEncoded() -> Swift.String {
        return self.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? self
    }
}
