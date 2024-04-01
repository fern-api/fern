using System.Text.Json.Serialization;
using Client.FolderC;

namespace Client.FolderB;

public class Foo
{
    [JsonPropertyName("foo")]
    public Foo? Foo { get; init; }
}
