using System.Text.Json.Serialization;

namespace SeedOauthClientCredentials.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
