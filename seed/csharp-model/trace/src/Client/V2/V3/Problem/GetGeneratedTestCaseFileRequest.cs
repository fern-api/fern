using System.Text.Json.Serialization;
using Client.V2.V3;

namespace Client.V2.V3;

public class GetGeneratedTestCaseFileRequest
{
    [JsonPropertyName("template")]
    public TestCaseTemplate? Template { get; init; }

    [JsonPropertyName("testCase")]
    public TestCaseV2 TestCase { get; init; }
}
