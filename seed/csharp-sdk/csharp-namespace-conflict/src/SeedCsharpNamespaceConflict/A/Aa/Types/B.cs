using SeedCsharpNamespaceConflict.Core;

namespace SeedCsharpNamespaceConflict.A.Aa;

public record B
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
