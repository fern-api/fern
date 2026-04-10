using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ExtendedInlineRequestBodyRequest
{
    [JsonPropertyName("child")]
    public required string Child { get; set; }

    [JsonPropertyName("parent")]
    public required string Parent { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
