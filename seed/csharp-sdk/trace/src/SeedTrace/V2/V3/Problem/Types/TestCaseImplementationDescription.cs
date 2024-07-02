using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public class TestCaseImplementationDescription
{
    [JsonPropertyName("boards")]
    public IEnumerable<object> Boards { get; init; }
}
