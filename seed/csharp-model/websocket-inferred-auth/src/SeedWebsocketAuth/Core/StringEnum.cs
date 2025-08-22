using System.Text.Json.Serialization;

namespace SeedWebsocketAuth.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
