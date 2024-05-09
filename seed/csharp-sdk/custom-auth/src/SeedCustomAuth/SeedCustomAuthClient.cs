using SeedCustomAuth;

namespace SeedCustomAuth;

public partial class SeedCustomAuthClient
{
    private RawClient _client;

    public SeedCustomAuthClient (string customAuthScheme, ClientOptions clientOptions) {
        _client = 
        new RawClient{
            new Dictionary<string, string> {
                { "X-API-KEY", customAuthScheme }, 
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions()}
        CustomAuth = 
        new CustomAuthClient{
            _client}
    }

    public CustomAuthClient CustomAuth { get; }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
