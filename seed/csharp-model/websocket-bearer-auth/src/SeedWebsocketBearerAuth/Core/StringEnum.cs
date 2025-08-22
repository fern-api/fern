using System.Text.Json.Serialization;

namespace SeedWebsocketBearerAuth.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
