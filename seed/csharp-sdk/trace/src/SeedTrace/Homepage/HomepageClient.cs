using SeedTrace;

namespace SeedTrace;

public class HomepageClient
{
    private RawClient _client;

    public HomepageClient(RawClient client)
    {
        _client = client;
    }

    public async void GetHomepageProblemsAsync() { }

    public async void SetHomepageProblemsAsync() { }
}
