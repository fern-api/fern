using System.Text.Json.Serialization;

namespace SeedCsharpSystemCollision.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
