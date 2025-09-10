using System.Text.Json.Serialization;

namespace SeedErrorProperty.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
