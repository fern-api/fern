using System.Text.Json.Serialization;
using SeedTraceClient.V2;

namespace SeedTraceClient.V2;

public class GetGeneratedTestCaseTemplateFileRequest
{
    [JsonPropertyName("template")]
    public TestCaseTemplate Template { get; init; }
}
