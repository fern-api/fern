using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public class DefaultProvidedFile
{
    [JsonPropertyName("file")]
    public FileInfoV2 File { get; init; }

    [JsonPropertyName("relatedTypes")]
    public IEnumerable<VariableType> RelatedTypes { get; init; }
}
