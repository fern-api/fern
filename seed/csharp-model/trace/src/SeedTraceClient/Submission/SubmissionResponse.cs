using System.Text.Json.Serialization;
using SeedTraceClient;
using OneOf;

namespace SeedTraceClient;

public class SubmissionResponse
{
    public class _ServerInitialized
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "serverInitialized";
    }
    public class _ProblemInitialized
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "problemInitialized";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _WorkspaceInitialized
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "workspaceInitialized";
    }
    public class _ServerErrored : ExceptionInfo
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "serverErrored";
    }
    public class _CodeExecutionUpdate
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "codeExecutionUpdate";

        [JsonPropertyName("value")]
        public OneOf<CodeExecutionUpdate._BuildingExecutor, CodeExecutionUpdate._Running, CodeExecutionUpdate._Errored, CodeExecutionUpdate._Stopped, CodeExecutionUpdate._Graded, CodeExecutionUpdate._GradedV2, CodeExecutionUpdate._WorkspaceRan, CodeExecutionUpdate._Recording, CodeExecutionUpdate._Recorded, CodeExecutionUpdate._InvalidRequest, CodeExecutionUpdate._Finished> Value { get; init; }
    }
    public class _Terminated : TerminatedResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "terminated";
    }
}
