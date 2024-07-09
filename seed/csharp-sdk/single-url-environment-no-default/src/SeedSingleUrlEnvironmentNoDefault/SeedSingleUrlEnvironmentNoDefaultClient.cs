using SeedSingleUrlEnvironmentNoDefault;
using SeedSingleUrlEnvironmentNoDefault.Core;

#nullable enable

namespace SeedSingleUrlEnvironmentNoDefault;

public partial class SeedSingleUrlEnvironmentNoDefaultClient
{
    private RawClient _client;

    public SeedSingleUrlEnvironmentNoDefaultClient(
        string? token = null,
        ClientOptions? clientOptions = null
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
        Dummy = new DummyClient(_client);
    }

    public DummyClient Dummy { get; }
}
