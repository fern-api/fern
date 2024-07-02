using SeedMixedCase;
using SeedMixedCase.Core;

#nullable enable

namespace SeedMixedCase;

public partial class SeedMixedCaseClient
{
    private RawClient _client;

    public SeedMixedCaseClient(ClientOptions clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }

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
