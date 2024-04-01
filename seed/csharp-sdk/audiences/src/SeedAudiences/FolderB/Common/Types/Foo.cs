using System.Text.Json.Serialization;
using SeedAudiences.FolderC;

namespace SeedAudiences.FolderB;

public class Foo
{
    [JsonPropertyName("foo")]
    public Foo? Foo { get; init; }
}
