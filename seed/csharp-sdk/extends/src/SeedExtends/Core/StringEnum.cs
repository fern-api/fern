using System.Text.Json.Serialization;

namespace SeedExtends.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
