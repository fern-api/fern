using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

public record DefaultProvidedFile
{
    [JsonPropertyName("file")]
    public required FileInfoV2 File { get; set; }

    [JsonPropertyName("relatedTypes")]
    public IEnumerable<object> RelatedTypes { get; set; } = new List<object>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
