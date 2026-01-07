namespace SeedTrace;

public partial interface IProblemClient
{
    /// <summary>
    /// Creates a problem
    /// </summary>
    Task<CreateProblemResponse> CreateProblemAsync(
        CreateProblemRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Updates a problem
    /// </summary>
    Task<UpdateProblemResponse> UpdateProblemAsync(
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
    Task<GetDefaultStarterFilesResponse> GetDefaultStarterFilesAsync(
        GetDefaultStarterFilesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
