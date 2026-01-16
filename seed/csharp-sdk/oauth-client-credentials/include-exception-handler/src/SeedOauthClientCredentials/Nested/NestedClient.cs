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
            Raw = new RawAccessClient(_client);
        }
        catch (Exception ex)
        {
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    public ApiClient Api { get; }

    public NestedClient.RawAccessClient Raw { get; }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }
    }
}
