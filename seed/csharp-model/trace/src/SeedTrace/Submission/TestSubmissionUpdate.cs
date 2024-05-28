using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class TestSubmissionUpdate
{
    [JsonPropertyName("updateTime")]
    public DateTime UpdateTime { get; init; }

    [JsonPropertyName("updateInfo")]
    public TestSubmissionUpdateInfo UpdateInfo { get; init; }
}
