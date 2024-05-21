using SeedValidation;

namespace SeedValidation;

public partial class SeedValidationClient
{
    private RawClient _client;

    public SeedValidationClient(ClientOptions clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
    }

    public async void CreateAsync() { }

    public async void GetAsync() { }

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
