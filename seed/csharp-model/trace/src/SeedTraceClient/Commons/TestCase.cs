using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class TestCase
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("params")]
    public List<OneOf<Value, Value, Value, Value, Value, MapValue, Value, BinaryTreeValue, SinglyLinkedListValue, DoublyLinkedListValue, NullValue>> Params { get; init; }
}
