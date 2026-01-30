namespace SeedMultiUrlEnvironment;

public partial interface ISeedMultiUrlEnvironmentClient
{
    public IEc2Client Ec2 { get; }
    public IS3Client S3 { get; }
}
