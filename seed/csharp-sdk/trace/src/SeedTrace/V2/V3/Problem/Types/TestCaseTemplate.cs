using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

public record TestCaseTemplate
{
    [JsonPropertyName("templateId")]
    public required string TemplateId { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("implementation")]
    public required TestCaseImplementation Implementation { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
