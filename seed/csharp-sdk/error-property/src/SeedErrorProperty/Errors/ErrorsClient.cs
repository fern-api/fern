using SeedErrorProperty.Core;

#nullable enable

namespace SeedErrorProperty;

public partial class ErrorsClient
{
    private RawClient _client;

    internal ErrorsClient(RawClient client)
    {
        _client = client;
    }
}
