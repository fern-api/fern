using SeedPackageYml;

namespace SeedPackageYml;

public partial class SeedPackageYmlClient
{
    private RawClient _client;

    public SeedPackageYmlClient(ClientOptions clientOptions)
    {
        _client = new RawClient(
            new Dictionary<string, string> { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }

    public async void EchoAsync() { }

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
