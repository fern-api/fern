using System.Text.Json.Serialization;
using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames;

public record ImportingType
{
    [JsonPropertyName("imported")]
    public required string Imported { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
