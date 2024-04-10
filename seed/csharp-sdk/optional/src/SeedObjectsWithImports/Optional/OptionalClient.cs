using SeedObjectsWithImports;

namespace SeedObjectsWithImports;

public class OptionalClient
{
    private RawClient _client;

    public OptionalClient(RawClient client)
    {
        _client = client;
    }

    public async void SendOptionalBodyAsync() { }
}
