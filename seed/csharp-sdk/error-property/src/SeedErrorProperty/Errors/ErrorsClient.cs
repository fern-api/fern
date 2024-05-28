using SeedErrorProperty;

#nullable enable

namespace SeedErrorProperty;

public class ErrorsClient
{
    private RawClient _client;

    public ErrorsClient(RawClient client)
    {
        _client = client;
    }
}
