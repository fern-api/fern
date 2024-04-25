using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class GetDefaultStarterFilesResponse
{
    [JsonPropertyName("files")]
    public List<Dictionary<Language, ProblemFiles>> Files { get; init; }
}
