using System.Text.Json.Serialization
using SeedTraceClient.V2

namespace SeedTraceClient.V2

public class BasicTestCaseTemplate
{
    [JsonPropertyName("templateId")]
    public string TemplateId { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("description")]
    public TestCaseImplementationDescription Description { get; init; }

    [JsonPropertyName("expectedValueParameterId")]
    public string ExpectedValueParameterId { get; init; }
}
