using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory;

public partial class SeedMixedFileDirectoryClient : ISeedMixedFileDirectoryClient
{
    private readonly RawClient _client;

    public SeedMixedFileDirectoryClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedMixedFileDirectory" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernmixed-file-directory/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Organization = new OrganizationClient(_client);
        User = new UserClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public OrganizationClient Organization { get; }

    public UserClient User { get; }

    public SeedMixedFileDirectoryClient.RawAccessClient Raw { get; }

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
