using System.Text.Json.Serialization;

namespace SeedAliasExtends.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
