using System.Text.Json.Serialization;
using SeedExamples;

namespace SeedExamples;

public class Response
{
    [JsonPropertyName("response")]
    public object Response_ { get; init; }

    [JsonPropertyName("identifiers")]
    public List<Identifier> Identifiers { get; init; }
}
