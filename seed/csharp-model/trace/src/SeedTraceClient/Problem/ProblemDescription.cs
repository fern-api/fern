using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class ProblemDescription
{
    [JsonPropertyName("boards")]
    public List<OneOf<Value,Value,Value>> Boards { get; init; }
}
