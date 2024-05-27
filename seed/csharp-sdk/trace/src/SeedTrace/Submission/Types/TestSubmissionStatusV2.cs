using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

namespace SeedTrace;

public class TestSubmissionStatusV2
{
    [JsonPropertyName("updates")]
    public List<TestSubmissionUpdate> Updates { get; init; }

    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }

    [JsonPropertyName("problemVersion")]
    public int ProblemVersion { get; init; }

    [JsonPropertyName("problemInfo")]
    public ProblemInfoV2 ProblemInfo { get; init; }
}
