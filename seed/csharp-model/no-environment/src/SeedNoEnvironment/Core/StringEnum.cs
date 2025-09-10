using System.Text.Json.Serialization;

namespace SeedNoEnvironment.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
