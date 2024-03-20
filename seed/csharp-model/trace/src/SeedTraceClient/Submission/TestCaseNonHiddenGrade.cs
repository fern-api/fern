using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class TestCaseNonHiddenGrade
{
    [JsonPropertyName("passed")]
    public bool Passed { get; init; }

    [JsonPropertyName("actualResult")]
    public OneOf<Value, Value, Value, Value, Value, MapValue, Value, BinaryTreeValue, SinglyLinkedListValue, DoublyLinkedListValue, NullValue>? ActualResult { get; init; }

    [JsonPropertyName("exception")]
    public OneOf<ExceptionInfo, Timeout>? Exception { get; init; }

    [JsonPropertyName("stdout")]
    public string Stdout { get; init; }
}
