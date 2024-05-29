using System.Text.Json.Serialization;
using SeedAudiences.FolderB;

#nullable enable

namespace SeedAudiences.FolderA;

public class Response
{
    [JsonPropertyName("foo")]
    public Foo? Foo { get; init; }
}
