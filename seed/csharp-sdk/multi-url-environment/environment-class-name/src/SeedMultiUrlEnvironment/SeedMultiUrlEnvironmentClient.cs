using SeedMultiUrlEnvironment.Core;

namespace SeedMultiUrlEnvironment;

public partial class SeedMultiUrlEnvironmentClient : ISeedMultiUrlEnvironmentClient
{
    private readonly RawClient _client;

    public SeedMultiUrlEnvironmentClient(string? token = null, ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token ?? ""}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedMultiUrlEnvironment" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernmulti-url-environment/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Ec2 = new Ec2Client(_client);
        S3 = new S3Client(_client);
    }

    public Ec2Client Ec2 { get; }

    public S3Client S3 { get; }
}
