using System.Text.Json.Serialization
using SeedTraceClient.V2.V3

namespace SeedTraceClient.V2.V3

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
