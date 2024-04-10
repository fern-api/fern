using SeedEnum;

namespace SeedEnum;

public class QueryParamClient
{
    private RawClient _client;

    public QueryParamClient(RawClient client)
    {
        _client = client;
    }

    public async void SendAsync() { }

    public async void SendListAsync() { }
}
