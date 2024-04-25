using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class ProblemFiles
{
    [JsonPropertyName("solutionFile")]
    public FileInfo SolutionFile { get; init; }

    [JsonPropertyName("readOnlyFiles")]
    public List<List<FileInfo>> ReadOnlyFiles { get; init; }
}
