using System.Text.Json.Serialization;

namespace SeedClientSideParams.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
