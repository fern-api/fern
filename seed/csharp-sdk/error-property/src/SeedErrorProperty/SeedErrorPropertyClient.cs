using System;
using SeedErrorProperty.Core;

#nullable enable

namespace SeedErrorProperty;

internal partial class SeedErrorPropertyClient
{
    public SeedErrorPropertyClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Errors = new ErrorsClient(_client);
        PropertyBasedError = new PropertyBasedErrorClient(_client);
    }

    public RawClient _client;

    public ErrorsClient Errors { get; init; }

    public PropertyBasedErrorClient PropertyBasedError { get; init; }
}
