public final class MultiUrlEnvironmentClient: Sendable {
    public let ec2: Ec2Client
    public let s3: S3Client
    private let config: ClientConfig
}