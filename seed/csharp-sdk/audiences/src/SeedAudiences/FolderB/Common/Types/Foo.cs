using System.Text.Json.Serialization;
using SeedAudiences.FolderC;

namespace SeedAudiences.FolderB;

public class Foo
{
    [JsonPropertyName("foo")]
    public List<Foo?> Foo_ { get; init; }
}
