using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2;

public record GetGeneratedTestCaseTemplateFileRequest
{
    [JsonPropertyName("template")]
    public required TestCaseTemplate Template { get; set; }
}
