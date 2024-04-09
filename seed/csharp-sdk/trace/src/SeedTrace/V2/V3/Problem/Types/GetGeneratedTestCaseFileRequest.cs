using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class GetGeneratedTestCaseFileRequest
{
    [JsonPropertyName("template")]
    public List<TestCaseTemplate?> Template { get; init; }

    [JsonPropertyName("testCase")]
    public TestCaseV2 TestCase { get; init; }
}
