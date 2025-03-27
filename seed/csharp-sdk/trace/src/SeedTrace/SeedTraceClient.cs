using SeedTrace.Core;
using SeedTrace.V2;

namespace SeedTrace;

public partial class SeedTraceClient
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
                { "X-Random-Header", xRandomHeader },
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
        Commons = new CommonsClient(_client);
        Homepage = new HomepageClient(_client);
        LangServer = new LangServerClient(_client);
        Migration = new MigrationClient(_client);
        Playlist = new PlaylistClient(_client);
        Problem = new ProblemClient(_client);
        Submission = new SubmissionClient(_client);
        Sysprop = new SyspropClient(_client);
    }

    public V2Client V2 { get; init; }

    public AdminClient Admin { get; init; }

    public CommonsClient Commons { get; init; }

    public HomepageClient Homepage { get; init; }

    public LangServerClient LangServer { get; init; }

    public MigrationClient Migration { get; init; }

    public PlaylistClient Playlist { get; init; }

    public ProblemClient Problem { get; init; }

    public SubmissionClient Submission { get; init; }

    public SyspropClient Sysprop { get; init; }
}
