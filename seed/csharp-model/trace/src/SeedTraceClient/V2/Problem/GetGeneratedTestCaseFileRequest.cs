using System.Text.Json.Serialization;
using SeedTraceClient.V2;

namespace SeedTraceClient.V2;

public class GetGeneratedTestCaseFileRequest
{
    [JsonPropertyName("template")]
    public TestCaseTemplate? Template { get; init; }

    [JsonPropertyName("testCase")]
    public TestCaseV2 TestCase { get; init; }
}
