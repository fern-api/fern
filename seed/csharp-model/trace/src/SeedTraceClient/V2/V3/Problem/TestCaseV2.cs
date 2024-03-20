using System.Text.Json.Serialization
using SeedTraceClient.V2.V3
using OneOf
using SeedTraceClient

namespace SeedTraceClient.V2.V3

public class TestCaseV2
{
    [JsonPropertyName("metadata")]
    public TestCaseMetadata Metadata { get; init; }

    [JsonPropertyName("implementation")]
    public OneOf<Value, TestCaseImplementation> Implementation { get; init; }

    [JsonPropertyName("arguments")]
    public Dictionary<string, OneOf<Value, Value, Value, Value, Value, MapValue, Value, BinaryTreeValue, SinglyLinkedListValue, DoublyLinkedListValue, NullValue>> Arguments { get; init; }

    [JsonPropertyName("expects")]
    public TestCaseExpects? Expects { get; init; }
}
