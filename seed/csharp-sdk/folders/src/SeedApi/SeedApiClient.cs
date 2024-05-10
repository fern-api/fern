using SeedApi;
using SeedApi.Folder;

namespace SeedApi;

public partial class SeedApiClient
{
    private RawClient _client;

    public SeedApiClient (ClientOptions clientOptions) {
        _client = 
        new RawClient{
            new Dictionary<string, string>() {
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions()}
        Folder = 
        new undefinedClient{
            _client}
    }

    public undefinedClient Folder { get; }

    public async void FooAsync() {
    }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
