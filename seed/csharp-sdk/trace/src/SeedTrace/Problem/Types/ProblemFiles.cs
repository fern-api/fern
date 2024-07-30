using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record ProblemFiles
{
    [JsonPropertyName("solutionFile")]
    public required FileInfo SolutionFile { get; }

    [JsonPropertyName("readOnlyFiles")]
    public IEnumerable<FileInfo> ReadOnlyFiles { get; } = new List<FileInfo>();
}
