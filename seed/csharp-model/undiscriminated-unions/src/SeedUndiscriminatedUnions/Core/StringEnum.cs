using System.Text.Json.Serialization;

namespace SeedUndiscriminatedUnions.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
