using SeedTrace.Core;

namespace SeedTrace.V2.V3;

public partial class V3Client : IV3Client
{
    private RawClient _client;

    internal V3Client(RawClient client)
    {
        _client = client;
        Problem = new ProblemClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public ProblemClient Problem { get; }

    public V3Client.RawAccessClient Raw { get; }

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
