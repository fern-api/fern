public struct ListUsersPaginationResponse {
    public let hasNextPage: Bool?
    public let page: Page?
    public let totalCount: Int
    public let data: [User]
}