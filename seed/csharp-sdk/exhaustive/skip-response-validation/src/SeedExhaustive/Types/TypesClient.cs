using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

public partial class TypesClient
{
    private RawClient _client;

    internal TypesClient(RawClient client)
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
