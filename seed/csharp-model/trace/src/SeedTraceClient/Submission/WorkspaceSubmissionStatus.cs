using SeedTraceClient
using System.Text.Json.Serialization
using OneOf
using StringEnum

namespace SeedTraceClient

public class WorkspaceSubmissionStatus
{
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

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "running"
        ;
        
        [JsonPropertyName("value")]
        public StringEnum<RunningSubmissionState> Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class WorkspaceRunDetails
     : WorkspaceRunDetails, IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "ran"
        ;
        
    }
    
    namespace SeedTraceClient

    public class WorkspaceRunDetails
     : WorkspaceRunDetails, IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "traced"
        ;
        
    }
    
    namespace SeedTraceClient

    private interface IBase
    {
    }
    
}
