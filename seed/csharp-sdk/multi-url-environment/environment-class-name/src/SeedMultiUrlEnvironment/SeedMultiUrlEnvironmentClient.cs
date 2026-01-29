using SeedMultiUrlEnvironment.Core;

namespace SeedMultiUrlEnvironment;

public partial class SeedMultiUrlEnvironmentClient : ISeedMultiUrlEnvironmentClient
{
    private readonly RawClient _client;

    public SeedMultiUrlEnvironmentClient(string? token = null, ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedMultiUrlEnvironment" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernmulti-url-environment/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        var clientOptionsWithAuth = clientOptions.Clone();
        var authHeaders = new Headers(
            new Dictionary<string, string>() { { "Authorization", $"Bearer {token ?? ""}" } }
        );
        foreach (var header in authHeaders)
        {
            clientOptionsWithAuth.Headers[header.Key] = header.Value;
        }
        _client = new RawClient(clientOptionsWithAuth);
        Ec2 = new Ec2Client(_client);
        S3 = new S3Client(_client);
    }

    public Ec2Client Ec2 { get; }

    public S3Client S3 { get; }
}
