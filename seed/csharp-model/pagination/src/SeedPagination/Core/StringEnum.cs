using System.Text.Json.Serialization;

namespace SeedPagination.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
