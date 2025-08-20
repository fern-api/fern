using System.Text.Json.Serialization;

namespace SeedCsharpNamespaceCollision.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
