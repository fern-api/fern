using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class TestSubmissionUpdate
{
    [JsonPropertyName("updateTime")]
    public DateTime UpdateTime { get; init; }
    [JsonPropertyName("updateInfo")]
    public OneOf<Value,Stopped,Value,GradedTestCaseUpdate,RecordedTestCaseUpdate,Finished> UpdateInfo { get; init; }
}
