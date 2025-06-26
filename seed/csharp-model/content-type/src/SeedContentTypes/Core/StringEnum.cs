using System.Text.Json.Serialization;

namespace SeedContentTypes.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
