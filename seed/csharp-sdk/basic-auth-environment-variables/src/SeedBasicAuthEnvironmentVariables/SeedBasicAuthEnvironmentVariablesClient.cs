using SeedBasicAuthEnvironmentVariables.Core;
using SeedBasicAuthEnvironmentVariables;

#nullable enable

namespace SeedBasicAuthEnvironmentVariables;

public partial class SeedBasicAuthEnvironmentVariablesClient
{
    private RawClient _client;

    public SeedBasicAuthEnvironmentVariablesClient (string username = null, string password = null, ClientOptions clientOptions = null) {
        username = username ?? GetFromEnvironmentOrThrow(
            "USERNAME",
            "Please pass in username or set the environment variable USERNAME."
        password = password ?? GetFromEnvironmentOrThrow(
            "PASSWORD",
            "Please pass in password or set the environment variable PASSWORD."
        _client = 
        new RawClient(
            new Dictionary<string, string>() {
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions());
        BasicAuth = 
        new BasicAuthClient(
            _client);
        Errors = 
        new ErrorsClient(
            _client);
    }

    public BasicAuthClient BasicAuth { get; }

    public ErrorsClient Errors { get; }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = System.Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
