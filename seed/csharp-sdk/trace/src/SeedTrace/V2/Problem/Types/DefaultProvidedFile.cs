using System.Text.Json.Serialization;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public record DefaultProvidedFile
{
    [JsonPropertyName("file")]
    public required FileInfoV2 File { get; }

    [JsonPropertyName("relatedTypes")]
    public IEnumerable<object> RelatedTypes { get; } = new List<object>();
}
