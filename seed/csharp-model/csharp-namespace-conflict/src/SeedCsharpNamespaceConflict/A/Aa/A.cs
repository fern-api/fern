using SeedCsharpNamespaceConflict.Core;

namespace SeedCsharpNamespaceConflict.A.Aa;

public record A
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
