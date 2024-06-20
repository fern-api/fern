using SeedMultiUrlEnvironmentNoDefault;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault;

public partial class SeedMultiUrlEnvironmentNoDefaultClient
{
    private RawClient _client;

    public SeedMultiUrlEnvironmentNoDefaultClient(
        string token = null,
        ClientOptions clientOptions = null
    )
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
        var value = System.Environment.GetEnvironmentVariable(env);
        if (value == null)
        {
            throw new Exception(message);
        }
        return value;
    }
}
