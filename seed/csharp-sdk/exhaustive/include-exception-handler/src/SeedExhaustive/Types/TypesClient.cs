using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

public partial class TypesClient
{
    private RawClient _client;

    private ExceptionHandler _exceptionHandler;

    internal TypesClient(RawClient client, ExceptionHandler exceptionHandler)
    {
        _client = client;
        _exceptionHandler = exceptionHandler;
        Enum = new EnumClient(_client, _exceptionHandler);
        Object = new ObjectClient(_client, _exceptionHandler);
        Union = new UnionClient(_client, _exceptionHandler);
    }

    public EnumClient Enum { get; }

    public ObjectClient Object { get; }

    public UnionClient Union { get; }
}
