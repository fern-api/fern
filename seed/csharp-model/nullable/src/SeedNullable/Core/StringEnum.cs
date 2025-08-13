using System.Text.Json.Serialization;

namespace SeedNullable.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
