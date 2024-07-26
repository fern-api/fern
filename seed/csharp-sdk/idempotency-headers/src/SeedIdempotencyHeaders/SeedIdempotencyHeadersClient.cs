using System;
using SeedIdempotencyHeaders;
using SeedIdempotencyHeaders.Core;

#nullable enable

namespace SeedIdempotencyHeaders;

public partial class SeedIdempotencyHeadersClient
{
    private RawClient _client;

    public SeedIdempotencyHeadersClient(string? token = null, ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Fern-Language", "C#" },
            },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Payment = new PaymentClient(_client);
    }

    public PaymentClient Payment { get; init; }
}
