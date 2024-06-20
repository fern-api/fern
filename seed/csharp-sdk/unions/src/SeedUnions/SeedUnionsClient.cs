using SeedUnions;

#nullable enable

namespace SeedUnions;

public partial class SeedUnionsClient
{
    private RawClient _client;

    public SeedUnionsClient(ClientOptions clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Types = new TypesClient(_client);
        Union = new UnionClient(_client);
    }

    public TypesClient Types { get; }

    public UnionClient Union { get; }

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
