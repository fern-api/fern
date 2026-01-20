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
            Raw = new WithRawResponseClient(_client);
        }
        catch (Exception ex)
        {
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    public ApiClient Api { get; }

    public NestedNoAuthClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
