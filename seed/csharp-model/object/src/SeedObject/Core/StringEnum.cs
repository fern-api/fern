using System.Text.Json.Serialization;

namespace SeedObject.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
