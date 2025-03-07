using SeedApi.Core;

namespace SeedApi;

public class CustomClient : BaseClient
{
    public CustomClient(string token, ClientOptions? clientOptions = null) : base(token) { }
}