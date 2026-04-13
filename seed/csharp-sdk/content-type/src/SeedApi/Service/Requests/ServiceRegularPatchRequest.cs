using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceRegularPatchRequest
{
    [JsonIgnore]
    public required string Id { get; set; }

    [JsonPropertyName("field1")]
    public string? Field1 { get; set; }

    [JsonPropertyName("field2")]
    public int? Field2 { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
