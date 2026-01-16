using SeedWebsocket.Core;

namespace SeedWebsocket.Empty;

public partial class EmptyClient : IEmptyClient
{
    private RawClient _client;

    internal EmptyClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public EmptyClient.RawAccessClient Raw { get; }

    public EmptyRealtimeApi CreateEmptyRealtimeApi()
    {
        return new EmptyRealtimeApi(new EmptyRealtimeApi.Options());
    }

    public EmptyRealtimeApi CreateEmptyRealtimeApi(EmptyRealtimeApi.Options options)
    {
        return new EmptyRealtimeApi(options);
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(
            HttpResponseMessage response
        )
        {
            var headers = new Dictionary<string, IEnumerable<string>>(
                StringComparer.OrdinalIgnoreCase
            );
            foreach (var header in response.Headers)
            {
                headers[header.Key] = header.Value.ToList();
            }
            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    headers[header.Key] = header.Value.ToList();
                }
            }
            return headers;
        }
    }
}
