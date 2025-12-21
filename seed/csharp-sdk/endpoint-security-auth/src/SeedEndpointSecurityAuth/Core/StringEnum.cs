using System.Text.Json.Serialization;

namespace SeedEndpointSecurityAuth.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
