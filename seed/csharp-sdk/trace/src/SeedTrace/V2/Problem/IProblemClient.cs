using SeedTrace;

namespace SeedTrace.V2;

public partial interface IProblemClient
{
    /// <summary>
    /// Returns lightweight versions of all problems
    /// </summary>
    Task<IEnumerable<LightweightProblemInfoV2>> GetLightweightProblemsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Returns latest versions of all problems
    /// </summary>
    Task<IEnumerable<ProblemInfoV2>> GetProblemsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Returns latest version of a problem
    /// </summary>
    Task<ProblemInfoV2> GetLatestProblemAsync(
        string problemId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Returns requested version of a problem
    /// </summary>
    Task<ProblemInfoV2> GetProblemVersionAsync(
        string problemId,
        int problemVersion,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
