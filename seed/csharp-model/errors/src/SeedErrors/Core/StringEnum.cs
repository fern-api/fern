using global::System.Text.Json.Serialization;

namespace SeedErrors.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
