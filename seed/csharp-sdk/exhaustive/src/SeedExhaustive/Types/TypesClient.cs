using SeedExhaustive.Core;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive.Types;

public class TypesClient
{
    private RawClient _client;

    public TypesClient(RawClient client)
    {
        _client = client;
        Enum = new EnumClient(_client);
        Object = new ObjectClient(_client);
        Union = new UnionClient(_client);
    }

    public EnumClient Enum { get; }

    public ObjectClient Object { get; }

    public UnionClient Union { get; }
}
