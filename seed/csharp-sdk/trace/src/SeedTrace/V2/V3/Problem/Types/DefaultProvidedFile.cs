using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public record DefaultProvidedFile
{
    [JsonPropertyName("file")]
    public required FileInfoV2 File { get; init; }

    [JsonPropertyName("relatedTypes")]
    public IEnumerable<object> RelatedTypes { get; init; } = new List<object>();
}
