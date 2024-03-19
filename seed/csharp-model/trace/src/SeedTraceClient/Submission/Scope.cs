using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class Scope
{
    [JsonPropertyName("variables")]
    public Dictionary<string,OneOf<Value,Value,Value,Value,Value,DebugMapValue,Value,BinaryTreeNodeAndTreeValue,SinglyLinkedListNodeAndListValue,DoublyLinkedListNodeAndListValue,UndefinedValue,NullValue,GenericValue>> Variables { get; init; }
}
