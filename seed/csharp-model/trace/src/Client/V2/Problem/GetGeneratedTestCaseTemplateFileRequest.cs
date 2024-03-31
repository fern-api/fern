using System.Text.Json.Serialization;
using Client.V2;

namespace Client.V2;

public class GetGeneratedTestCaseTemplateFileRequest
{
    [JsonPropertyName("template")]
    public TestCaseTemplate Template { get; init; }
}
