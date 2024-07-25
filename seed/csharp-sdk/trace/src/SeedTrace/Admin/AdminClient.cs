using System.Net.Http;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class AdminClient
{
    private RawClient _client;

    public AdminClient(RawClient client)
    {
        _client = client;
    }

    public async Task UpdateTestSubmissionStatusAsync(Guid submissionId, object request)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Post,
                Path = $"/admin/store-test-submission-status/{submissionId}",
                Body = request
            }
        );
    }

    public async Task SendTestSubmissionUpdateAsync(Guid submissionId, TestSubmissionUpdate request)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Post,
                Path = $"/admin/store-test-submission-status-v2/{submissionId}",
                Body = request
            }
        );
    }

    public async Task UpdateWorkspaceSubmissionStatusAsync(Guid submissionId, object request)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Post,
                Path = $"/admin/store-workspace-submission-status/{submissionId}",
                Body = request
            }
        );
    }

    public async Task SendWorkspaceSubmissionUpdateAsync(
        Guid submissionId,
        WorkspaceSubmissionUpdate request
    )
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Post,
                Path = $"/admin/store-workspace-submission-status-v2/{submissionId}",
                Body = request
            }
        );
    }

    public async Task StoreTracedTestCaseAsync(
        Guid submissionId,
        string testCaseId,
        StoreTracedTestCaseRequest request
    )
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Post,
                Path = $"/admin/store-test-trace/submission/{submissionId}/testCase/{testCaseId}",
                Body = request
            }
        );
    }

    public async Task StoreTracedTestCaseV2Async(
        Guid submissionId,
        string testCaseId,
        IEnumerable<TraceResponseV2> request
    )
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Post,
                Path =
                    $"/admin/store-test-trace-v2/submission/{submissionId}/testCase/{testCaseId}",
                Body = request
            }
        );
    }

    public async Task StoreTracedWorkspaceAsync(
        Guid submissionId,
        StoreTracedWorkspaceRequest request
    )
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Post,
                Path = $"/admin/store-workspace-trace/submission/{submissionId}",
                Body = request
            }
        );
    }

    public async Task StoreTracedWorkspaceV2Async(
        Guid submissionId,
        IEnumerable<TraceResponseV2> request
    )
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Post,
                Path = $"/admin/store-workspace-trace-v2/submission/{submissionId}",
                Body = request
            }
        );
    }
}
