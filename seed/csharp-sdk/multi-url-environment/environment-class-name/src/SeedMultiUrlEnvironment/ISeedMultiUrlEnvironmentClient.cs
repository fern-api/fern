namespace SeedMultiUrlEnvironment;

public partial interface ISeedMultiUrlEnvironmentClient
{
    public Ec2Client Ec2 { get; }
    public S3Client S3 { get; }
}
