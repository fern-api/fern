using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class TestCaseResult
{
    [JsonPropertyName("expectedResult")]
    public OneOf<Value, Value, Value, Value, Value, MapValue, Value, BinaryTreeValue, SinglyLinkedListValue, DoublyLinkedListValue, NullValue> ExpectedResult { get; init; }

    [JsonPropertyName("actualResult")]
    public OneOf<Value, ExceptionInfo, Value> ActualResult { get; init; }

    [JsonPropertyName("passed")]
    public bool Passed { get; init; }
}
