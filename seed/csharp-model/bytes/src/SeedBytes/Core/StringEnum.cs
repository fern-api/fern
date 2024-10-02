using System.Text.Json.Serialization;

namespace SeedBytes.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
