using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public record GetGeneratedTestCaseFileRequest
{
    [JsonPropertyName("template")]
    public TestCaseTemplate? Template { get; set; }

    [JsonPropertyName("testCase")]
    public required TestCaseV2 TestCase { get; set; }
}
