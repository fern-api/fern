using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record GetDefaultStarterFilesResponse
{
    [JsonPropertyName("files")]
    public Dictionary<Language, ProblemFiles> Files { get; set; } =
        new Dictionary<Language, ProblemFiles>();
}
