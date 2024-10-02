using System.Text.Json.Serialization;

namespace SeedWebsocket.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
