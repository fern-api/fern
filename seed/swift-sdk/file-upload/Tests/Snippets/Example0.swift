import Foundation
import FileUpload

enum Example0 {
    static func snippet() async throws {
        let client = FileUploadClient(baseURL: "https://api.fern.com")

        _ = try await client.service.justFile(request: .init(file: .init(data: Data("".utf8))))
    }
}
