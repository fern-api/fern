using SeedCsharpNamespaceConflict.Core;

#nullable enable

namespace SeedCsharpNamespaceConflict.A.Aa;

public record A
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
