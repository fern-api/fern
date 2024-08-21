using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Types;

public partial class TypesClient
{
    private RawClient _client;

    internal TypesClient (RawClient client) {
        _client = client;
        Enum = 
        new EnumClientnew EnumClient(
            _client
        );
        Object = 
        new ObjectClientnew ObjectClient(
            _client
        );
        Union = 
        new UnionClientnew UnionClient(
            _client
        );
    }

    public EnumClient Enum { get; }

    public ObjectClient Object { get; }

    public UnionClient Union { get; }

}
