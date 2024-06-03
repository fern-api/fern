using SeedTrace;

#nullable enable

namespace SeedTrace;

public class AdminClient
{
    private RawClient _client;

    public AdminClient(RawClient client)
    {
        _client = client;
    }

    public async void UpdateTestSubmissionStatusAsync(
        Guid submissionId,
        TestSubmissionStatus request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = $"/store-test-submission-status/{submissionId}",
                Body = request
            }
        );
    }

    public async void SendTestSubmissionUpdateAsync(Guid submissionId, TestSubmissionUpdate request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = $"/store-test-submission-status-v2/{submissionId}",
                Body = request
            }
        );
    }

    public async void UpdateWorkspaceSubmissionStatusAsync(
        Guid submissionId,
        WorkspaceSubmissionStatus request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = $"/store-workspace-submission-status/{submissionId}",
                Body = request
            }
        );
    }

    public async void SendWorkspaceSubmissionUpdateAsync(
        Guid submissionId,
        WorkspaceSubmissionUpdate request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = $"/store-workspace-submission-status-v2/{submissionId}",
                Body = request
            }
        );
    }

    public async void StoreTracedTestCaseAsync(
        Guid submissionId,
        string testCaseId,
        StoreTracedTestCaseRequest request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = $"/store-test-trace/submission/{submissionId}/testCase/{testCaseId}",
                Body = request
            }
        );
    }

    public async void StoreTracedTestCaseV2Async(
        Guid submissionId,
        string testCaseId,
        IEnumerable<TraceResponseV2> request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = $"/store-test-trace-v2/submission/{submissionId}/testCase/{testCaseId}",
                Body = request
            }
        );
    }

    public async void StoreTracedWorkspaceAsync(
        Guid submissionId,
        StoreTracedWorkspaceRequest request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = $"/store-workspace-trace/submission/{submissionId}",
                Body = request
            }
        );
    }

    public async void StoreTracedWorkspaceV2Async(
        Guid submissionId,
        IEnumerable<TraceResponseV2> request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = $"/store-workspace-trace-v2/submission/{submissionId}",
                Body = request
            }
        );
    }
}
