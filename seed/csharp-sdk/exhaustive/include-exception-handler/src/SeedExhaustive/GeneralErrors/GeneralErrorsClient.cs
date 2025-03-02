using SeedExhaustive.Core;

namespace SeedExhaustive;

public partial class GeneralErrorsClient
{
    private RawClient _client;

    private ExceptionHandler _exceptionHandler;

    internal GeneralErrorsClient(RawClient client, ExceptionHandler exceptionHandler)
    {
        _client = client;
        _exceptionHandler = exceptionHandler;
    }
}
