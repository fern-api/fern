using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class DefaultProvidedFile
{
    [JsonPropertyName("file")]
    public FileInfoV2 File { get; init; }

    [JsonPropertyName("relatedTypes")]
    public List<VariableType> RelatedTypes { get; init; }
}
