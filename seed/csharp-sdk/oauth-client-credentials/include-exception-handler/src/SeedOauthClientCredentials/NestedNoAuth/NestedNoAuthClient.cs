using SeedOauthClientCredentials.Core;

namespace SeedOauthClientCredentials.NestedNoAuth;

public partial class NestedNoAuthClient : INestedNoAuthClient
{
    private RawClient _client;

    internal NestedNoAuthClient(RawClient client)
    {
        try
        {
            _client = client;
            Api = new ApiClient(_client);
        }
        catch (Exception ex)
        {
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    public ApiClient Api { get; }
}
