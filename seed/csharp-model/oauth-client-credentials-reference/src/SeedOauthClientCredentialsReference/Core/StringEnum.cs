using global::System.Text.Json.Serialization;

namespace SeedOauthClientCredentialsReference.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
