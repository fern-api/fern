using global::System.Text.Json.Serialization;

namespace SeedPropertyAccess.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
