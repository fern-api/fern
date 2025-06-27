using System.Text.Json.Serialization;

namespace SeedOauthClientCredentialsEnvironmentVariables.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
