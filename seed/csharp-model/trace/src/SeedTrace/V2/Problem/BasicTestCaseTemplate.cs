using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record BasicTestCaseTemplate
{
    [JsonPropertyName("templateId")]
    public required string TemplateId { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("description")]
    public required TestCaseImplementationDescription Description { get; set; }

    [JsonPropertyName("expectedValueParameterId")]
    public required string ExpectedValueParameterId { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
