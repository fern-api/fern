using System;
using SeedMultiUrlEnvironment;
using SeedMultiUrlEnvironment.Core;

#nullable enable

namespace SeedMultiUrlEnvironment;

public partial class SeedMultiUrlEnvironmentClient
{
    private RawClient _client;

    public SeedMultiUrlEnvironmentClient(string? token = null, ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Fern-Language", "C#" },
            },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Ec2 = new Ec2Client(_client);
        S3 = new S3Client(_client);
    }

    public Ec2Client Ec2 { get; init; }

    public S3Client S3 { get; init; }
}
