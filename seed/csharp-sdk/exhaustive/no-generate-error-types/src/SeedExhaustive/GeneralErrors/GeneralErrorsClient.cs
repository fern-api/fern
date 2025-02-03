using SeedExhaustive.Core;

namespace SeedExhaustive;

public partial class GeneralErrorsClient
{
    private RawClient _client;

    internal GeneralErrorsClient(RawClient client)
    {
        _client = client;
    }
}
