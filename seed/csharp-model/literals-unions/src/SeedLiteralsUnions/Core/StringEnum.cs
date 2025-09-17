using System.Text.Json.Serialization;

namespace SeedLiteralsUnions.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
