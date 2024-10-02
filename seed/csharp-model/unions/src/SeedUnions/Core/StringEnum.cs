using System.Text.Json.Serialization;

namespace SeedUnions.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
