using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record Request
{
    [JsonPropertyName("union")]
    public OneOf<Dictionary<string, object?>?, NamedMetadata>? Union { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
