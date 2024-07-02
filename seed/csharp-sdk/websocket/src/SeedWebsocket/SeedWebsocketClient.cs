using SeedWebsocket;

#nullable enable

namespace SeedWebsocket;

public partial class SeedWebsocketClient
{
    private RawClient _client;

    public SeedWebsocketClient(ClientOptions clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Realtime = new RealtimeClient(_client);
    }

    public RealtimeClient Realtime { get; }

    private string GetFromEnvironmentOrThrow(string env, string message)
    {
        var value = System.Environment.GetEnvironmentVariable(env);
        if (value == null)
        {
            throw new Exception(message);
        }
        return value;
    }
}
