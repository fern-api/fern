using global::System.Text.Json.Serialization;

namespace SeedPaginationUriPath.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
