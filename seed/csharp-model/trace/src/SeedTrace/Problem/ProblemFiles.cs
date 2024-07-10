using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record ProblemFiles
{
    [JsonPropertyName("solutionFile")]
    public required FileInfo SolutionFile { get; init; }

    [JsonPropertyName("readOnlyFiles")]
    public IEnumerable<FileInfo> ReadOnlyFiles { get; init; } = new List<FileInfo>();
}
