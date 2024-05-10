using SeedMultiUrlEnvironment;

namespace SeedMultiUrlEnvironment;

public partial class SeedMultiUrlEnvironmentClient
{
    private RawClient _client;

    public SeedMultiUrlEnvironmentClient(string token = null, ClientOptions clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Fern-Language", "C#" },
            },
            clientOptions ?? new ClientOptions()
        );
        Ec2 = new Ec2Client(_client);
        S3 = new S3Client(_client);
    }

    public Ec2Client Ec2 { get; }

    public S3Client S3 { get; }

    private string GetFromEnvironmentOrThrow(string env, string message)
    {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null)
        {
            throw new Exception(message);
        }
        return value;
    }
}
