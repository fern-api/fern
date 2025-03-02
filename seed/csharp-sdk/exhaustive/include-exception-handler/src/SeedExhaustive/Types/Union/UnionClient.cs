using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

public partial class UnionClient
{
    private RawClient _client;

    private ExceptionHandler _exceptionHandler;

    internal UnionClient(RawClient client, ExceptionHandler exceptionHandler)
    {
        _client = client;
        _exceptionHandler = exceptionHandler;
    }
}
