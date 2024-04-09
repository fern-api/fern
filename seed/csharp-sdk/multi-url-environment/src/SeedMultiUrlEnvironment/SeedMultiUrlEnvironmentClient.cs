using SeedMultiUrlEnvironment;

namespace SeedMultiUrlEnvironment;

public partial class SeedMultiUrlEnvironmentClient
{
    public SeedMultiUrlEnvironmentClient (string token){
    }
    public Ec2Client Ec2 { get; }

    public S3Client S3 { get; }
}
