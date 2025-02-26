using System.Text.Json.Serialization;
using SeedFileUpload.Core;

namespace SeedFileUpload;

public record MyObjectWithOptional
{
    [JsonPropertyName("prop")]
    public required string Prop { get; set; }

    [JsonPropertyName("optionalProp")]
    public string? OptionalProp { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
