using System.Text.Json.Serialization
using SeedAudiencesClient.FolderB

namespace SeedAudiencesClient.FolderA

public class Response
{
    [JsonPropertyName("foo")]
    public Foo? Foo { get; init; }
}
