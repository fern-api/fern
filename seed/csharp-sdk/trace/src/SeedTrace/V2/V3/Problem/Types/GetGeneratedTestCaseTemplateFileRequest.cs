using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

public record GetGeneratedTestCaseTemplateFileRequest
{
    [JsonPropertyName("template")]
    public required TestCaseTemplate Template { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
