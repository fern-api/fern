using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.FolderA;

public partial class FolderAClient : IFolderAClient
{
    private RawClient _client;

    internal FolderAClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public ServiceClient Service { get; }

    public FolderAClient.RawAccessClient Raw { get; }

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
