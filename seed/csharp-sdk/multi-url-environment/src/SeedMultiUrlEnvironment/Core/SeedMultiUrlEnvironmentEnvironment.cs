using SeedMultiUrlEnvironment.Core;

#nullable enable

namespace SeedMultiUrlEnvironment.Core;

public class SeedMultiUrlEnvironmentEnvironment
{
    public static SeedMultiUrlEnvironmentEnvironment PRODUCTION =
        new SeedMultiUrlEnvironmentEnvironment
        {
            Ec2 = "https://ec2.aws.com",
            S3 = "https://s3.aws.com"
        };

    public static SeedMultiUrlEnvironmentEnvironment STAGING =
        new SeedMultiUrlEnvironmentEnvironment
        {
            Ec2 = "https://staging.ec2.aws.com",
            S3 = "https://staging.s3.aws.com"
        };

    /// <summary>
    /// URL for the ec2 service
    /// </summary>
    public string Ec2 { get; init; }

    /// <summary>
    /// URL for the s3 service
    /// </summary>
    public string S3 { get; init; }
}
