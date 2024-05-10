using SeedOauthClientCredentialsEnvironmentVariables;

namespace SeedOauthClientCredentialsEnvironmentVariables;

public partial class SeedOauthClientCredentialsEnvironmentVariablesClient
{
    private RawClient _client;

    public SeedOauthClientCredentialsEnvironmentVariablesClient (string token, ClientOptions clientOptions) {
        _client = 
        new RawClient{
            new Dictionary<string, string>() {
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions()}
        Auth = 
        new AuthClient{
            _client}
    }

    public AuthClient Auth { get; }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
