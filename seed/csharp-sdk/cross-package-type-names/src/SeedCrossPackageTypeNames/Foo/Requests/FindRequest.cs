using System.Text.Json.Serialization;
using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames;

public record FindRequest
{
    [JsonIgnore]
    public string? OptionalString { get; set; }

    [JsonPropertyName("publicProperty")]
    public string? PublicProperty { get; set; }

    [JsonPropertyName("privateProperty")]
    public int? PrivateProperty { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
