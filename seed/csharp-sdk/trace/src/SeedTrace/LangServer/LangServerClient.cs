using SeedTrace.Core;

namespace SeedTrace;

public partial class LangServerClient
{
    private RawClient _client;

    internal LangServerClient(RawClient client)
    {
        _client = client;
    }
}
