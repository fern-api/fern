using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class TestSubmissionUpdate
{
    [JsonPropertyName("updateTime")]
    public DateTime UpdateTime { get; init; }

    [JsonPropertyName("updateInfo")]
    public TestSubmissionUpdateInfo UpdateInfo { get; init; }
}
