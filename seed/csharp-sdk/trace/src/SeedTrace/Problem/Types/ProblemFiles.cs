using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record ProblemFiles
{
    [JsonPropertyName("solutionFile")]
    public required FileInfo SolutionFile { get; set; }

    [JsonPropertyName("readOnlyFiles")]
    public IEnumerable<FileInfo> ReadOnlyFiles { get; set; } = new List<FileInfo>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
