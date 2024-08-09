using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public record TestCaseImplementation
{
    [JsonPropertyName("description")]
    public required TestCaseImplementationDescription Description { get; set; }

    [JsonPropertyName("function")]
    public required object Function { get; set; }
}
