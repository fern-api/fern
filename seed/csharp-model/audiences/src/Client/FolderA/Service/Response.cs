using System.Text.Json.Serialization;
using Client.FolderB;

namespace Client.FolderA;

public class Response
{
    [JsonPropertyName("foo")]
    public Foo? Foo { get; init; }
}
