using System.Text.Json.Serialization;
using SeedQueryParameters.Core;

namespace SeedQueryParameters;

public record GetUsersRequest
{
    [JsonIgnore]
    public required int Limit { get; set; }

    [JsonIgnore]
    public required string Id { get; set; }

    [JsonIgnore]
    public required DateOnly Date { get; set; }

    [JsonIgnore]
    public required DateTime Deadline { get; set; }

    [JsonIgnore]
    public required string Bytes { get; set; }

    [JsonIgnore]
    public required User User { get; set; }

    [JsonIgnore]
    public IEnumerable<User> UserList { get; set; } = new List<User>();

    [JsonIgnore]
    public DateTime? OptionalDeadline { get; set; }

    [JsonIgnore]
    public Dictionary<string, string> KeyValue { get; set; } = new Dictionary<string, string>();

    [JsonIgnore]
    public string? OptionalString { get; set; }

    [JsonIgnore]
    public required NestedUser NestedUser { get; set; }

    [JsonIgnore]
    public User? OptionalUser { get; set; }

    [JsonIgnore]
    public IEnumerable<User> ExcludeUser { get; set; } = new List<User>();

    [JsonIgnore]
    public IEnumerable<string> Filter { get; set; } = new List<string>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
