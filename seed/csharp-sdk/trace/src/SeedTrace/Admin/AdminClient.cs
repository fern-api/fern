using SeedTrace;

namespace SeedTrace;

public class AdminClient
{
    private RawClient _client;

    public AdminClient(RawClient client)
    {
        _client = client;
    }

    public async void UpdateTestSubmissionStatusAsync() { }

    public async void SendTestSubmissionUpdateAsync() { }

    public async void UpdateWorkspaceSubmissionStatusAsync() { }

    public async void SendWorkspaceSubmissionUpdateAsync() { }

    public async void StoreTracedTestCaseAsync() { }

    public async void StoreTracedTestCaseV2Async() { }

    public async void StoreTracedWorkspaceAsync() { }

    public async void StoreTracedWorkspaceV2Async() { }
}
