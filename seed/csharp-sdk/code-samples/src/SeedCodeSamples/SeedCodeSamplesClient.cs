using SeedCodeSamples;

namespace SeedCodeSamples;

public partial class SeedCodeSamplesClient
{
    private RawClient _client;

    public SeedCodeSamplesClient (ClientOptions clientOptions) {
        _client = 
        new RawClient{
            new Dictionary<string, string> {
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions()}
        Service = 
        new ServiceClient{
            _client}
    }

    public ServiceClient Service { get; }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
