using System.Text.Json.Serialization;
using SeedTraceClient.V2;

namespace SeedTraceClient.V2;

public class TestCaseTemplate
{
    [JsonPropertyName("templateId")]
    public string TemplateId { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("implementation")]
    public TestCaseImplementation Implementation { get; init; }
}
