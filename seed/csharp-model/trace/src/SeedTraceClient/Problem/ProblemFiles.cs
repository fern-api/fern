using System.Text.Json.Serialization;
using SeedTraceClient;

namespace SeedTraceClient;

public class ProblemFiles
{
    [JsonPropertyName("solutionFile")]
    public FileInfo SolutionFile { get; init; }

    [JsonPropertyName("readOnlyFiles")]
    public List<FileInfo> ReadOnlyFiles { get; init; }
}
