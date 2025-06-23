using System.Text.Json.Serialization;

namespace SeedPublicObject.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
