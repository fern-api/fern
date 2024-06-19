using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public class Request
{
    [JsonPropertyName("request")]
    public object Request_ { get; init; }
}
