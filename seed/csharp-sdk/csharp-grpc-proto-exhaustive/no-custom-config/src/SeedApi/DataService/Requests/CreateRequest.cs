using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

namespace SeedApi;

[Serializable]
public record CreateRequest
{
    /// <summary>
    /// The name of the resource to create.
    /// </summary>
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    /// <summary>
    /// A description of the resource.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// The tool choice configuration.
    /// </summary>
    [JsonPropertyName("tool_choice")]
    public ToolChoice? ToolChoice { get; set; }

    /// <summary>
    /// A URL to fetch the resource from.
    /// </summary>
    [JsonPropertyName("url")]
    public string? Url { get; set; }

    /// <summary>
    /// Inline content for the resource.
    /// </summary>
    [JsonPropertyName("content")]
    public string? Content { get; set; }

    /// <summary>
    /// Optional metadata for the resource.
    /// </summary>
    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

    /// <summary>
    /// Maps the CreateRequest type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.CreateRequest ToProto()
    {
        var result = new Proto.CreateRequest();
        result.Name = Name;
        if (Description != null)
        {
            result.Description = Description ?? "";
        }
        if (ToolChoice != null)
        {
            result.ToolChoice = ToolChoice.ToProto();
        }
        if (Url != null)
        {
            result.Url = Url ?? "";
        }
        if (Content != null)
        {
            result.Content = Content ?? "";
        }
        if (Metadata != null)
        {
            result.Metadata = Metadata.ToProto();
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
