using SeedTrace.Core;
using SeedTrace.V2;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public partial class SeedTraceClient
{
    private RawClient _client;

    public SeedTraceClient (string token, string?? xRandomHeader = null, ClientOptions? clientOptions = null) {
        _client = 
        new RawClient(
            new Dictionary<string, string>() {
                { "X-Random-Header", xRandomHeader }, 
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions());
        V2 = 
        new V2Client(
            _client);
        Admin = 
        new AdminClient(
            _client);
        Commons = 
        new CommonsClient(
            _client);
        Homepage = 
        new HomepageClient(
            _client);
        LangServer = 
        new LangServerClient(
            _client);
        Migration = 
        new MigrationClient(
            _client);
        Playlist = 
        new PlaylistClient(
            _client);
        Problem = 
        new ProblemClient(
            _client);
        Submission = 
        new SubmissionClient(
            _client);
        Sysprop = 
        new SyspropClient(
            _client);
    }

    public V2Client V2 { get; }

    public AdminClient Admin { get; }

    public CommonsClient Commons { get; }

    public HomepageClient Homepage { get; }

    public LangServerClient LangServer { get; }

    public MigrationClient Migration { get; }

    public PlaylistClient Playlist { get; }

    public ProblemClient Problem { get; }

    public SubmissionClient Submission { get; }

    public SyspropClient Sysprop { get; }

}
