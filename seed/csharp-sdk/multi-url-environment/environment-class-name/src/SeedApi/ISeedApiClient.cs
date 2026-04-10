namespace SeedApi;

public partial interface ISeedApiClient
{
    public IEc2Client Ec2 { get; }
    public IS3Client S3 { get; }
}
