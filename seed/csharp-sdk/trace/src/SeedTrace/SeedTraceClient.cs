using SeedTrace.Core;
using SeedTrace.V2;

namespace SeedTrace;

public partial class SeedTraceClient : ISeedTraceClient
{
    private readonly RawClient _client;

    public SeedTraceClient(
        string token,
        string? xRandomHeader = null,
        ClientOptions? clientOptions = null
    )
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Random-Header", xRandomHeader ?? "" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedTrace" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferntrace/0.0.1" },
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
        V2 = new V2Client(_client);
        Admin = new AdminClient(_client);
        Homepage = new HomepageClient(_client);
        Migration = new MigrationClient(_client);
        Playlist = new PlaylistClient(_client);
        Problem = new ProblemClient(_client);
        Submission = new SubmissionClient(_client);
        Sysprop = new SyspropClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public V2Client V2 { get; }

    public AdminClient Admin { get; }

    public HomepageClient Homepage { get; }

    public MigrationClient Migration { get; }

    public PlaylistClient Playlist { get; }

    public ProblemClient Problem { get; }

    public SubmissionClient Submission { get; }

    public SyspropClient Sysprop { get; }

    public SeedTraceClient.RawAccessClient Raw { get; }

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
