using System.Text.Json.Serialization;
using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.FolderC;

public record Foo
{
    [JsonPropertyName("bar_property")]
    public required string BarProperty { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
