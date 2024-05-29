using System.Text.Json.Serialization;

#nullable enable

namespace SeedFileUpload;

public class MyObject
{
    [JsonPropertyName("foo")]
    public string Foo { get; init; }
}
