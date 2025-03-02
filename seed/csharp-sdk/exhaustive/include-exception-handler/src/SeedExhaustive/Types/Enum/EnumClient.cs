using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

public partial class EnumClient
{
    private RawClient _client;

    private ExceptionHandler _exceptionHandler;

    internal EnumClient(RawClient client, ExceptionHandler exceptionHandler)
    {
        _client = client;
        _exceptionHandler = exceptionHandler;
    }
}
