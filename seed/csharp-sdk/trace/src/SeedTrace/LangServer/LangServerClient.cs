using SeedTrace;

namespace SeedTrace;

public class LangServerClient
{
    private RawClient _client;

    public LangServerClient(RawClient client)
    {
        _client = client;
    }
}
