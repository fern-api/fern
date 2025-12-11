using System.Text.Json.Serialization;

namespace SeedOauthClientCredentialsMandatoryAuth.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
