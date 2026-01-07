using System.Text.Json.Serialization;
using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames;

[Serializable]
public record FindRequest
{
    [JsonIgnore]
    public string? OptionalString { get; set; }

    [Optional]
    [JsonPropertyName("publicProperty")]
    public string? PublicProperty { get; set; }

    [Optional]
    [JsonPropertyName("privateProperty")]
    public int? PrivateProperty { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
