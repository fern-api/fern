using SeedIdempotencyHeaders.Core;

namespace SeedIdempotencyHeaders;

public partial class SeedIdempotencyHeadersClient : ISeedIdempotencyHeadersClient
{
    private readonly RawClient _client;

    public SeedIdempotencyHeadersClient(string? token = null, ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedIdempotencyHeaders" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernidempotency-headers/0.0.1" },
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
        Payment = new PaymentClient(_client);
    }

    public PaymentClient Payment { get; }
}
