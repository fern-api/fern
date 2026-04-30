using global::System.Text.Json.Serialization;
using OneOf;
using SeedUnionQueryParameters.Core;

namespace SeedUnionQueryParameters;

[Serializable]
public record SubscribeEventsRequest
{
    [JsonIgnore]
    public OneOf<EventTypeEnum, IEnumerable<EventTypeEnum>>? EventType { get; set; }

    [JsonIgnore]
    public OneOf<string, IEnumerable<string>>? Tags { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
