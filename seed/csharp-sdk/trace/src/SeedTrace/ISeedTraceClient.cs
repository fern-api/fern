using SeedTrace.V2;

namespace SeedTrace;

public partial interface ISeedTraceClient
{
    public V2Client V2 { get; }
    public AdminClient Admin { get; }
    public HomepageClient Homepage { get; }
    public MigrationClient Migration { get; }
    public PlaylistClient Playlist { get; }
    public ProblemClient Problem { get; }
    public SubmissionClient Submission { get; }
    public SyspropClient Sysprop { get; }
}
