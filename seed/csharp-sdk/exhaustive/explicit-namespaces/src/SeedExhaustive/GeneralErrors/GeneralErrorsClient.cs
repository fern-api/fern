using SeedExhaustive.Core;

namespace SeedExhaustive.GeneralErrors;

public partial class GeneralErrorsClient
{
    private RawClient _client;

    internal GeneralErrorsClient(RawClient client)
    {
        _client = client;
    }
}
