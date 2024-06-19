using SeedSingleUrlEnvironmentDefault;

#nullable enable

namespace SeedSingleUrlEnvironmentDefault;

public partial class SeedSingleUrlEnvironmentDefaultClient
{
    private RawClient _client;

    public SeedSingleUrlEnvironmentDefaultClient(
        string token = null,
        ClientOptions clientOptions = null
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

    private string GetFromEnvironmentOrThrow(string env, string message)
    {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null)
        {
            throw new Exception(message);
        }
        return value;
    }
}
