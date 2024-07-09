using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public record BasicTestCaseTemplate
{
    [JsonPropertyName("templateId")]
    public required string TemplateId { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("description")]
    public required TestCaseImplementationDescription Description { get; init; }

    [JsonPropertyName("expectedValueParameterId")]
    public required string ExpectedValueParameterId { get; init; }
}
