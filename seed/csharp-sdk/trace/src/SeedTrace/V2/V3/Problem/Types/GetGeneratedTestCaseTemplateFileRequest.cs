using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class GetGeneratedTestCaseTemplateFileRequest
{
    [JsonPropertyName("template")]
    public TestCaseTemplate Template { get; init; }
}
