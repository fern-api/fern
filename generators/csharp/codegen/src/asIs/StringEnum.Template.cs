using System.Text.Json.Serialization;

namespace <%= namespace%>;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
