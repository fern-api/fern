namespace SeedTrace;

public partial interface IProblemClient
{
    /// <summary>
    /// Creates a problem
    /// </summary>
    WithRawResponseTask<CreateProblemResponse> CreateProblemAsync(
        CreateProblemRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Updates a problem
    /// </summary>
    WithRawResponseTask<UpdateProblemResponse> UpdateProblemAsync(
        string problemId,
        CreateProblemRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Soft deletes a problem
    /// </summary>
    Task DeleteProblemAsync(
        string problemId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Returns default starter files for problem
    /// </summary>
    WithRawResponseTask<GetDefaultStarterFilesResponse> GetDefaultStarterFilesAsync(
        GetDefaultStarterFilesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
