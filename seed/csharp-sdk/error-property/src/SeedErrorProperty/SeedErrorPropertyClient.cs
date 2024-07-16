using SeedErrorProperty;
using SeedErrorProperty.Core;

#nullable enable

namespace SeedErrorProperty;

public partial class SeedErrorPropertyClient
{
    private RawClient _client;

    public SeedErrorPropertyClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Errors = new ErrorsClient(_client);
        PropertyBasedError = new PropertyBasedErrorClient(_client);
    }

    public ErrorsClient Errors { get; init; }

    public PropertyBasedErrorClient PropertyBasedError { get; init; }
}
