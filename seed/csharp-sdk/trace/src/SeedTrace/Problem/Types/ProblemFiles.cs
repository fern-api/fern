using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class ProblemFiles
{
    [JsonPropertyName("solutionFile")]
    public FileInfo SolutionFile { get; init; }

    [JsonPropertyName("readOnlyFiles")]
    public IEnumerable<FileInfo> ReadOnlyFiles { get; init; }
}
