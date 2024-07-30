using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

#nullable enable

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
    public required ProblemInfoV2 ProblemInfo { get; set; }
}
