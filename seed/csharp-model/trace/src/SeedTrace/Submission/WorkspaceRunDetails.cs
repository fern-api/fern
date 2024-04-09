using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class WorkspaceRunDetails
{
    [JsonPropertyName("exceptionV2")]
    public List<ExceptionV2?> ExceptionV2 { get; init; }

    [JsonPropertyName("exception")]
    public List<ExceptionInfo?> Exception { get; init; }

    [JsonPropertyName("stdout")]
    public string Stdout { get; init; }
}
