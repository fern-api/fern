namespace SeedMultiUrlEnvironmentNoDefault;

public partial interface ISeedMultiUrlEnvironmentNoDefaultClient
{
    public Ec2Client Ec2 { get; }
    public S3Client S3 { get; }
}
