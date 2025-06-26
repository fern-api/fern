using System.Text.Json.Serialization;
using SeedExtends.Core;

namespace SeedExtends;

[Serializable]
public record Inlined
{
    [JsonPropertyName("unique")]
    public required string Unique { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
