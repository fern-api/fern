using SeedMultiUrlEnvironmentNoDefault.Core;

namespace SeedMultiUrlEnvironmentNoDefault;

public partial class SeedMultiUrlEnvironmentNoDefaultClient
    : ISeedMultiUrlEnvironmentNoDefaultClient
{
    private readonly RawClient _client;

    public SeedMultiUrlEnvironmentNoDefaultClient(
        string? token = null,
        ClientOptions? clientOptions = null
    )
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token ?? ""}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedMultiUrlEnvironmentNoDefault" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernmulti-url-environment-no-default/0.0.1" },
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
        Raw = new WithRawResponseClient(_client);
    }

    public Ec2Client Ec2 { get; }

    public S3Client S3 { get; }

    public SeedMultiUrlEnvironmentNoDefaultClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
