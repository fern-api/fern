using SeedLiteral;

namespace SeedLiteral;

public class QueryClient
{
    private RawClient _client;

    public QueryClient(RawClient client)
    {
        _client = client;
    }

    public async void SendAsync() { }
}
