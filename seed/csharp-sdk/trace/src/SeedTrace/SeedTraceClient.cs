using System;
using SeedTrace;
using SeedTrace.Core;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace;

public partial class SeedTraceClient
{
    private RawClient _client;

    public SeedTraceClient(
        string token,
        string? xRandomHeader = null,
        ClientOptions? clientOptions = null
    )
    {
        _client = new RawClient(
            new Dictionary<string, string>()
            {
                { "X-Random-Header", xRandomHeader },
                { "X-Fern-Language", "C#" },
            },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
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
