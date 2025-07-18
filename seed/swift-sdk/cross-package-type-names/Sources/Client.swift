public final class CrossPackageTypeNamesClient: Sendable {
    public let commons: CommonsClient
    public let folderA: FolderAClient
    public let folderB: FolderBClient
    public let folderC: FolderCClient
    public let folderD: FolderDClient
    public let foo: FooClient
    private let config: ClientConfig
}