using SeedPagination.Core;
using SeedPagination.InlineUsers;

namespace SeedPagination;

public partial class SeedPaginationClient : ISeedPaginationClient
{
    private readonly RawClient _client;

    public SeedPaginationClient(string token, ClientOptions? clientOptions = null)
    {
        try
        {
            var defaultHeaders = new Headers(
                new Dictionary<string, string>()
                {
                    { "Authorization", $"Bearer {token}" },
                    { "X-Fern-Language", "C#" },
                    { "X-Fern-SDK-Name", "SeedPagination" },
                    { "X-Fern-SDK-Version", Version.Current },
                    { "User-Agent", "Fernpagination/0.0.1" },
                }
            );
            clientOptions ??= new ClientOptions();
            clientOptions.ExceptionHandler = new ExceptionHandler(
                new SeedPaginationExceptionInterceptor(clientOptions)
            );
            foreach (var header in defaultHeaders)
            {
                if (!clientOptions.Headers.ContainsKey(header.Key))
                {
                    clientOptions.Headers[header.Key] = header.Value;
                }
            }
            _client = new RawClient(clientOptions);
            Complex = new ComplexClient(_client);
            InlineUsers = new InlineUsersClient(_client);
            Users = new UsersClient(_client);
            Raw = new RawAccessClient(_client);
        }
        catch (Exception ex)
        {
            var interceptor = new SeedPaginationExceptionInterceptor(clientOptions);
            interceptor.Intercept(ex);
            throw;
        }
    }

    public ComplexClient Complex { get; }

    public InlineUsersClient InlineUsers { get; }

    public UsersClient Users { get; }

    public SeedPaginationClient.RawAccessClient Raw { get; }

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
