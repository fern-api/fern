using SeedPagination.Core;

namespace SeedPagination.InlineUsers;

public partial class InlineUsersClient : IInlineUsersClient
{
    private RawClient _client;

    internal InlineUsersClient(RawClient client)
    {
        _client = client;
        InlineUsers = new InlineUsersClient_(_client);
        Raw = new RawAccessClient(_client);
    }

    public InlineUsersClient_ InlineUsers { get; }

    public InlineUsersClient.RawAccessClient Raw { get; }

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
