using System.Text.Json.Serialization;
using OneOf;
using SeedTrace;

namespace SeedTrace;

public class TestSubmissionUpdate
{
    [JsonPropertyName("updateTime")]
    public DateTime UpdateTime { get; init; }

    [JsonPropertyName("updateInfo")]
    public OneOf<TestSubmissionUpdateInfo._Running, TestSubmissionUpdateInfo._Stopped, TestSubmissionUpdateInfo._Errored, TestSubmissionUpdateInfo._GradedTestCase, TestSubmissionUpdateInfo._RecordedTestCase, TestSubmissionUpdateInfo._Finished> UpdateInfo { get; init; }
}
