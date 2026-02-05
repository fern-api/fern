using SeedTrace;
using SeedTrace.V2.V3;

namespace SeedTrace.V2;

public partial interface IV2Client
{
    public ProblemClient Problem { get; }
    public V3Client V3 { get; }
    Task TestAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
