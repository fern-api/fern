using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record GetFooRequest
{
    /// <summary>
    /// An optional baz
    /// </summary>
    [JsonIgnore]
    public string? OptionalBaz { get; set; }

    /// <summary>
    /// An optional baz
    /// </summary>
    [JsonIgnore]
    public string? OptionalNullableBaz { get; set; }

    /// <summary>
    /// A required baz
    /// </summary>
    [JsonIgnore]
    public required string RequiredBaz { get; set; }

    /// <summary>
    /// A required baz
    /// </summary>
    [JsonIgnore]
    public string? RequiredNullableBaz { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
