using SeedTraceClient
using System.Text.Json.Serialization
using OneOf

namespace SeedTraceClient

public class VariableValue
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
        public List<OneOf<Value,Value,Value,Value,Value,MapValue,Value,BinaryTreeValue,SinglyLinkedListValue,DoublyLinkedListValue,NullValue>> Value { get; init; }
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
