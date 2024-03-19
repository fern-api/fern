using System.Text.Json.Serialization
using OneOf
using SeedTraceClient.V2.V3

namespace SeedTraceClient.V2.V3

public class TestCaseImplementationDescription
{
    [JsonPropertyName("boards")]
    public List<OneOf<Value,Value>> Boards { get; init; }
}
