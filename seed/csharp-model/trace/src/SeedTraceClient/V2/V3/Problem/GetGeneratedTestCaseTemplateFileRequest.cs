using System.Text.Json.Serialization
using SeedTraceClient.V2.V3

namespace SeedTraceClient.V2.V3

public class GetGeneratedTestCaseTemplateFileRequest
{
    [JsonPropertyName("template")]
    public TestCaseTemplate Template { get; init; }
}
