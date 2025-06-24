using System.Text.Json.Serialization;

namespace SeedMixedFileDirectory.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
