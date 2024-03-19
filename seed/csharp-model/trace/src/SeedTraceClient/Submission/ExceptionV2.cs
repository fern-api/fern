using SeedTraceClient
using System.Text.Json.Serialization

namespace SeedTraceClient

public class ExceptionV2
{
    namespace SeedTraceClient

    public class ExceptionInfo
     : ExceptionInfo, IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "generic"
        ;
        
    }
    
    namespace SeedTraceClient

    public class Timeout
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "timeout"
        ;
        
    }
    
    namespace SeedTraceClient

    private interface IBase
    {
    }
    
}
