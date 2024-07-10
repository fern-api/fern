using System.Text.Json.Serialization;
using SeedExamples;

#nullable enable

namespace SeedExamples;

public record Response
{
    [JsonPropertyName("response")]
    public required object Response_ { get; init; }

    [JsonPropertyName("identifiers")]
    public IEnumerable<Identifier> Identifiers { get; init; } = new List<Identifier>();
}
