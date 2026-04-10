namespace SeedMultiUrlEnvironmentNoDefault;

public partial interface ISeedMultiUrlEnvironmentNoDefaultClient
{
    public IEc2Client Ec2 { get; }
    public IS3Client S3 { get; }
}
