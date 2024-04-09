using SeedTrace.V2;
using SeedTrace;

namespace SeedTrace;

public partial class SeedTraceClient
{
    public SeedTraceClient (string token){
    }
    public SeedTraceClient (string token, List<string?> xRandomHeader){
    }
    public undefinedClient V2 { get; }

    public AdminClient Admin { get; }

    public HomepageClient Homepage { get; }

    public MigrationClient Migration { get; }

    public PlaylistClient Playlist { get; }

    public ProblemClient Problem { get; }

    public SubmissionClient Submission { get; }

    public SyspropClient Sysprop { get; }
}
