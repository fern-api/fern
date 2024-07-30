using System.Text.Json.Serialization;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public record TestCaseImplementation
{
    [JsonPropertyName("description")]
    public required TestCaseImplementationDescription Description { get; set; }

    [JsonPropertyName("function")]
    public required object Function { get; set; }
}
