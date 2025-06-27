using System.Text.Json.Serialization;

namespace SeedAudiences.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
