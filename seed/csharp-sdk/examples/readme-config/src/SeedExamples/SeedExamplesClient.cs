using OneOf;
using SeedExamples.Core;
using SeedExamples.File_;
using SeedExamples.Health;

namespace SeedExamples;

public partial class SeedExamplesClient
{
    private readonly RawClient _client;

    private RawSeedExamplesClient _rawClient;

    public SeedExamplesClient(string token, ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedExamples" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernexamples/0.0.1" },
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
        File = new FileClient(_client);
        Health = new HealthClient(_client);
        Service = new ServiceClient(_client);
        _rawClient = new RawSeedExamplesClient(_client);
        WithRawResponse = _rawClient;
    }

    public FileClient File { get; }

    public HealthClient Health { get; }

    public ServiceClient Service { get; }

    /// <summary>
    /// Access endpoints with raw HTTP response data (status code, headers).
    /// </summary>
    public RawSeedExamplesClient WithRawResponse { get; }

    /// <example><code>
    /// await client.EchoAsync("Hello world!\\n\\nwith\\n\\tnewlines");
    /// </code></example>
    public async Task<string> EchoAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse
                .EchoAsync(request, options, cancellationToken)
                .ConfigureAwait(false)
        ).Body;
    }

    /// <example><code>
    /// await client.CreateTypeAsync(BasicType.Primitive);
    /// </code></example>
    public async Task<Identifier> CreateTypeAsync(
        OneOf<BasicType, ComplexType> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse
                .CreateTypeAsync(request, options, cancellationToken)
                .ConfigureAwait(false)
        ).Body;
    }
}
