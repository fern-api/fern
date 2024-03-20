using System.Text.Json.Serialization;
using SeedAudiencesClient.FolderC;

namespace SeedAudiencesClient.FolderB;

public class Foo
{
    [JsonPropertyName("foo")]
    public Foo? Foo { get; init; }
}
