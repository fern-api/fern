using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record TestSubmissionStatusV2
{
    [JsonPropertyName("updates")]
    public IEnumerable<TestSubmissionUpdate> Updates { get; set; } =
        new List<TestSubmissionUpdate>();

    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; set; }

    [JsonPropertyName("problemInfo")]
    public required V2.ProblemInfoV2 ProblemInfo { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
