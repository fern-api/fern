using System.Text.Json.Serialization;

namespace SeedExamples;

public class Response
{
    [JsonPropertyName("response")]
    public object Response_ { get; init; }
}
