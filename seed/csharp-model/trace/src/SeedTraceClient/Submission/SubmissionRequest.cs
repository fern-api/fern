using SeedTraceClient
using System.Text.Json.Serialization

namespace SeedTraceClient

public class SubmissionRequest
{
    namespace SeedTraceClient

    public class InitializeWorkspaceRequest
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "initializeWorkspaceRequest"
        ;
        
    }
    
    namespace SeedTraceClient

    private interface IBase
    {
    }
    
}
