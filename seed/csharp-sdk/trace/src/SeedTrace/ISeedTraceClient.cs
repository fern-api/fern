using SeedTrace.V2;

namespace SeedTrace;

public partial interface ISeedTraceClient
{
    public IV2Client V2 { get; }
    public IAdminClient Admin { get; }
    public IHomepageClient Homepage { get; }
    public IMigrationClient Migration { get; }
    public IPlaylistClient Playlist { get; }
    public IProblemClient Problem { get; }
    public ISubmissionClient Submission { get; }
    public ISyspropClient Sysprop { get; }
}
