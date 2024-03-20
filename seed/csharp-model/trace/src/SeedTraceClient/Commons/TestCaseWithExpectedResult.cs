using System.Text.Json.Serialization
using SeedTraceClient
using OneOf

namespace SeedTraceClient

public class TestCaseWithExpectedResult
{
    [JsonPropertyName("testCase")]
    public TestCase TestCase { get; init; }

    [JsonPropertyName("expectedResult")]
    public OneOf<Value, Value, Value, Value, Value, MapValue, Value, BinaryTreeValue, SinglyLinkedListValue, DoublyLinkedListValue, NullValue> ExpectedResult { get; init; }
}
