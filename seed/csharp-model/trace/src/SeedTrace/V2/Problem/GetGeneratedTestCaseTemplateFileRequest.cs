using System.Text.Json.Serialization;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class GetGeneratedTestCaseTemplateFileRequest
{
    [JsonPropertyName("template")]
    public TestCaseTemplate Template { get; init; }
}
