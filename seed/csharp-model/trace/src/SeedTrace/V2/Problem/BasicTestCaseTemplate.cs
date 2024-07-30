using System.Text.Json.Serialization;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public record BasicTestCaseTemplate
{
    [JsonPropertyName("templateId")]
    public required string TemplateId { get; }

    [JsonPropertyName("name")]
    public required string Name { get; }

    [JsonPropertyName("description")]
    public required TestCaseImplementationDescription Description { get; }

    [JsonPropertyName("expectedValueParameterId")]
    public required string ExpectedValueParameterId { get; }
}
