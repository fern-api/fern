using System.Text.Json.Serialization;

namespace SeedOauthClientCredentialsWithVariables.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
