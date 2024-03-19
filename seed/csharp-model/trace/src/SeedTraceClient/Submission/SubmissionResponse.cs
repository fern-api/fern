using SeedTraceClient
using System.Text.Json.Serialization
using OneOf

namespace SeedTraceClient

public class SubmissionResponse
{
    namespace SeedTraceClient

    public class ServerInitialized
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "serverInitialized"
        ;
        
    }
    
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "problemInitialized"
        ;
        
        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class WorkspaceInitialized
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "workspaceInitialized"
        ;
        
    }
    
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "codeExecutionUpdate"
        ;
        
        [JsonPropertyName("value")]
        public OneOf<BuildingExecutorResponse,RunningResponse,ErroredResponse,StoppedResponse,GradedResponse,GradedResponseV2,WorkspaceRanResponse,RecordingResponseNotification,RecordedResponseNotification,InvalidRequestResponse,FinishedResponse> Value { get; init; }
    }
    
    namespace SeedTraceClient

    private interface IBase
    {
    }
    
}
