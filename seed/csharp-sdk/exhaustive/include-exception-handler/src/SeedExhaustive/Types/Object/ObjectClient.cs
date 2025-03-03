using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

public partial class ObjectClient
{
    private RawClient _client;

    private readonly ExceptionHandler _exceptionHandler;

    internal ObjectClient(RawClient client, ExceptionHandler exceptionHandler)
    {
        _client = client;
        _exceptionHandler = exceptionHandler;
    }
}
