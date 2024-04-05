using System.Text.Json.Serialization;

namespace SeedExtends;

public class Docs
{
    [JsonPropertyName("docs")]
    public string Docs_ { get; init; }
}
