using SeedTraceClient
using System.Text.Json.Serialization
using StringEnum
using OneOf

namespace SeedTraceClient

public class TestSubmissionUpdateInfo
{
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "running"
        ;
        
        [JsonPropertyName("value")]
        public StringEnum<RunningSubmissionState> Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class Stopped
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "stopped"
        ;
        
    }
    
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "errored"
        ;
        
        [JsonPropertyName("value")]
        public OneOf<CompileError,RuntimeError,InternalError> Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class Finished
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "finished"
        ;
        
    }
    
    namespace SeedTraceClient

    private interface IBase
    {
    }
    
}
