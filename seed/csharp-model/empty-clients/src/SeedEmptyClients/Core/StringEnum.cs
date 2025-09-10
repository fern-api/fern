using System.Text.Json.Serialization;

namespace SeedEmptyClients.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
