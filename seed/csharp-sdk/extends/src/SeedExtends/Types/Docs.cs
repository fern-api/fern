using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtends;

public class Docs
{
    [JsonPropertyName("docs")]
    public string Docs_ { get; init; }
}
