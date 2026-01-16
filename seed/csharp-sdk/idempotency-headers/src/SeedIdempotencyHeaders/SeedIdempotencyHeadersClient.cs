using SeedIdempotencyHeaders.Core;

namespace SeedIdempotencyHeaders;

public partial class SeedIdempotencyHeadersClient : ISeedIdempotencyHeadersClient
{
    private readonly RawClient _client;

    public SeedIdempotencyHeadersClient(string? token = null, ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token ?? ""}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedIdempotencyHeaders" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernidempotency-headers/0.0.1" },
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
        Payment = new PaymentClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public PaymentClient Payment { get; }

    public SeedIdempotencyHeadersClient.RawAccessClient Raw { get; }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }
    }
}
