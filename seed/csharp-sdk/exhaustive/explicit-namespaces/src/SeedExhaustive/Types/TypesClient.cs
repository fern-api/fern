using SeedExhaustive.Core;
using SeedExhaustive.Types.Docs;
using SeedExhaustive.Types.Enum;
using SeedExhaustive.Types.Object;
using SeedExhaustive.Types.Union;

namespace SeedExhaustive.Types;

public partial class TypesClient
{
    private RawClient _client;

    internal TypesClient(RawClient client)
    {
        _client = client;
        Docs = new DocsClient(_client);
        Enum = new EnumClient(_client);
        Object = new ObjectClient(_client);
        Union = new UnionClient(_client);
    }

    public DocsClient Docs { get; }

    public EnumClient Enum { get; }

    public ObjectClient Object { get; }

    public UnionClient Union { get; }
}
