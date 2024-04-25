using SeedTrace;

namespace SeedTrace.V2.V3;

public class ProblemClient
{
    private RawClient _client;

    public ProblemClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Returns lightweight versions of all problems
    /// </summary>
    public async void GetLightweightProblemsAsync() { }

    /// <summary>
    /// Returns latest versions of all problems
    /// </summary>
    public async void GetProblemsAsync() { }

    /// <summary>
    /// Returns latest version of a problem
    /// </summary>
    public async void GetLatestProblemAsync() { }

    /// <summary>
    /// Returns requested version of a problem
    /// </summary>
    public async void GetProblemVersionAsync() { }
}
