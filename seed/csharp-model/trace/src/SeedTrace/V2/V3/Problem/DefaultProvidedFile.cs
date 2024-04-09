using System.Text.Json.Serialization;
using SeedTrace.V2.V3;
using SeedTrace;

namespace SeedTrace.V2.V3;

public class DefaultProvidedFile
{
    [JsonPropertyName("file")]
    public FileInfoV2 File { get; init; }

    [JsonPropertyName("relatedTypes")]
    public List<List<VariableType>> RelatedTypes { get; init; }
}
