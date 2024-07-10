using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace;

public record TestSubmissionStatusV2
{
    [JsonPropertyName("updates")]
    public IEnumerable<TestSubmissionUpdate> Updates { get; init; } =
        new List<TestSubmissionUpdate>();

    [JsonPropertyName("problemId")]
    public required string ProblemId { get; init; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; init; }

    [JsonPropertyName("problemInfo")]
    public required ProblemInfoV2 ProblemInfo { get; init; }
}
