using SeedExhaustive.Types;

namespace SeedExhaustive;

public class PostWithObjectBody
{
    public string String { get; init; }

    public int Integer { get; init; }

    public ObjectWithOptionalField NestedObject { get; init; }
}
