using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record ProblemFiles
{
    [JsonPropertyName("solutionFile")]
    public required FileInfo SolutionFile { get; set; }

    [JsonPropertyName("readOnlyFiles")]
    public IEnumerable<FileInfo> ReadOnlyFiles { get; set; } = new List<FileInfo>();

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
