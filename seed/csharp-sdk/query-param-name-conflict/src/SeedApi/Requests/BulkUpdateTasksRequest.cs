using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record BulkUpdateTasksRequest
{
    [JsonIgnore]
    public string? FilterAssignedTo { get; set; }

    [JsonIgnore]
    public string? FilterIsComplete { get; set; }

    [JsonIgnore]
    public string? FilterDate { get; set; }

    /// <summary>
    /// Comma-separated list of fields to include in the response.
    /// </summary>
    [JsonIgnore]
    public string? Fields { get; set; }

    [JsonPropertyName("assigned_to")]
    public string? BulkUpdateTasksRequestAssignedTo { get; set; }

    [JsonPropertyName("date")]
    public DateOnly? BulkUpdateTasksRequestDate { get; set; }

    [JsonPropertyName("is_complete")]
    public bool? BulkUpdateTasksRequestIsComplete { get; set; }

    [JsonPropertyName("text")]
    public string? Text { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
