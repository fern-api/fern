using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record FooFindRequest
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
