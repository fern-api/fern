using System.Text.Json.Serialization;
using SeedContentTypes.Core;

namespace SeedContentTypes;

[Serializable]
public record RegularPatchRequest
{
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
