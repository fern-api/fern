using System.Text.Json.Serialization;

namespace SeedCsharpNamespaceConflict.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
