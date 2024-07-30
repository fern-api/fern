using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.GeneralErrors;

public class GeneralErrorsClient
{
    private RawClient _client;

    public GeneralErrorsClient(RawClient client)
    {
        _client = client;
    }
}
