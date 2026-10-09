namespace SeedTrace;

public partial interface IAdminClient
{
    WithRawResponseTask UpdateTestSubmissionStatusAsync(
        string submissionId,
        TestSubmissionStatus request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask SendTestSubmissionUpdateAsync(
        string submissionId,
        TestSubmissionUpdate request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask UpdateWorkspaceSubmissionStatusAsync(
        string submissionId,
        WorkspaceSubmissionStatus request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask SendWorkspaceSubmissionUpdateAsync(
        string submissionId,
        WorkspaceSubmissionUpdate request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask StoreTracedTestCaseAsync(
        string submissionId,
        string testCaseId,
        StoreTracedTestCaseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask StoreTracedTestCaseV2Async(
        string submissionId,
        string testCaseId,
        IEnumerable<TraceResponseV2> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask StoreTracedWorkspaceAsync(
        string submissionId,
        StoreTracedWorkspaceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask StoreTracedWorkspaceV2Async(
        string submissionId,
        IEnumerable<TraceResponseV2> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
