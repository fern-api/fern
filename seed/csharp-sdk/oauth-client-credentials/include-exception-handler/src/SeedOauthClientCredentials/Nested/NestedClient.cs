using SeedOauthClientCredentials.Core;

namespace SeedOauthClientCredentials.Nested;

public partial class NestedClient : INestedClient
{
    private RawClient _client;

    internal NestedClient(RawClient client)
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
