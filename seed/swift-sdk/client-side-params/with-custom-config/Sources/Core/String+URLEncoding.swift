import Foundation

extension String {
    func urlPathEncoded() -> String {
        return self.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? self
    }

    func urlQueryEncoded() -> String {
        return self.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? self
    }
}
