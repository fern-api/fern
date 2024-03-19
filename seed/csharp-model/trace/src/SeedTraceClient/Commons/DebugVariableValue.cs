using SeedTraceClient
using System.Text.Json.Serialization
using OneOf

namespace SeedTraceClient

public class DebugVariableValue
{
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "integerValue"
        ;
        
        [JsonPropertyName("value")]
        public int Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "booleanValue"
        ;
        
        [JsonPropertyName("value")]
        public bool Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "doubleValue"
        ;
        
        [JsonPropertyName("value")]
        public double Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "stringValue"
        ;
        
        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "charValue"
        ;
        
        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "listValue"
        ;
        
        [JsonPropertyName("value")]
        public List<OneOf<Value,Value,Value,Value,Value,DebugMapValue,Value,BinaryTreeNodeAndTreeValue,SinglyLinkedListNodeAndListValue,DoublyLinkedListNodeAndListValue,UndefinedValue,NullValue,GenericValue>> Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class UndefinedValue
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "undefinedValue"
        ;
        
    }
    
    namespace SeedTraceClient

    public class NullValue
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "nullValue"
        ;
        
    }
    
    namespace SeedTraceClient

    private interface IBase
    {
    }
    
}
