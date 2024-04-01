using System.Text.Json.Serialization;
using SeedAudiences.FolderB;

namespace SeedAudiences.FolderA;

public class Response
{
    [JsonPropertyName("foo")]
    public Foo? Foo { get; init; }
}
