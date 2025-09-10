using System.Text.Json.Serialization;

namespace SeedOauthClientCredentialsDefault.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
