namespace SeedTrace;

public partial interface IAdminClient
{
    Task UpdateTestSubmissionStatusAsync(
        string submissionId,
        TestSubmissionStatus request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task SendTestSubmissionUpdateAsync(
        string submissionId,
        TestSubmissionUpdate request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task UpdateWorkspaceSubmissionStatusAsync(
        string submissionId,
        WorkspaceSubmissionStatus request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task SendWorkspaceSubmissionUpdateAsync(
        string submissionId,
        WorkspaceSubmissionUpdate request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task StoreTracedTestCaseAsync(
        string submissionId,
        string testCaseId,
        StoreTracedTestCaseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task StoreTracedTestCaseV2Async(
        string submissionId,
        string testCaseId,
        IEnumerable<TraceResponseV2> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task StoreTracedWorkspaceAsync(
        string submissionId,
        StoreTracedWorkspaceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task StoreTracedWorkspaceV2Async(
        string submissionId,
        IEnumerable<TraceResponseV2> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
