using SeedErrorProperty;

namespace SeedErrorProperty;

public partial class SeedErrorPropertyClient
{
    private RawClient _client;

    public SeedErrorPropertyClient(ClientOptions clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        PropertyBasedError = new PropertyBasedErrorClient(_client);
    }

    public PropertyBasedErrorClient PropertyBasedError { get; }

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
