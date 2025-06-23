using System.Text.Json.Serialization;

namespace SeedCsharpAccess.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
