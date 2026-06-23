import Foundation

/// The environments that the SDK can connect to. Each environment defines a base URL per service.
public struct MultiUrlEnvironmentNoDefaultEnvironment: Sendable {
    public let ec2: String
    public let s3: String
    public static let production: MultiUrlEnvironmentNoDefaultEnvironment = .init(
        ec2: "https://ec2.aws.com",
        s3: "https://s3.aws.com"
    )
    public static let staging: MultiUrlEnvironmentNoDefaultEnvironment = .init(
        ec2: "https://staging.ec2.aws.com",
        s3: "https://staging.s3.aws.com"
    )

    public init(
        ec2: String,
        s3: String
    ) {
        self.ec2 = ec2
        self.s3 = s3
    }
}