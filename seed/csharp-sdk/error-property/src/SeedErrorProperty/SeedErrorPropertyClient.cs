using SeedErrorProperty;

#nullable enable

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
        Errors = new ErrorsClient(_client);
        PropertyBasedError = new PropertyBasedErrorClient(_client);
    }

    public ErrorsClient Errors { get; }

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
