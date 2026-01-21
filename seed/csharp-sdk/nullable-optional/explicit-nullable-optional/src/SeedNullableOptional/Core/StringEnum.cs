using System.Text.Json.Serialization;

namespace SeedNullableOptional.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
