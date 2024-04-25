using SeedTrace;

namespace SeedTrace;

public class ProblemClient
{
    private RawClient _client;

    public ProblemClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Creates a problem
    /// </summary>
    public async void CreateProblemAsync() { }

    /// <summary>
    /// Updates a problem
    /// </summary>
    public async void UpdateProblemAsync() { }

    /// <summary>
    /// Soft deletes a problem
    /// </summary>
    public async void DeleteProblemAsync() { }

    /// <summary>
    /// Returns default starter files for problem
    /// </summary>
    public async void GetDefaultStarterFilesAsync() { }
}
