using SeedErrorProperty.Core;

namespace SeedErrorProperty;

public partial class ErrorsClient
{
    private RawClient _client;

    internal ErrorsClient(RawClient client)
    {
        _client = client;
    }
}
