using SeedExamples;
using SeedExamples.Commons;
using SeedExamples.File;
using SeedExamples.Health;

#nullable enable

namespace SeedExamples;

public partial class SeedExamplesClient
{
    private RawClient _client;

    public SeedExamplesClient(string token, ClientOptions clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Commons = new CommonsClient(_client);
        File = new FileClient(_client);
        Health = new HealthClient(_client);
        Service = new ServiceClient(_client);
        Types = new TypesClient(_client);
    }

    public CommonsClient Commons { get; }

    public FileClient File { get; }

    public HealthClient Health { get; }

    public ServiceClient Service { get; }

    public TypesClient Types { get; }

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
