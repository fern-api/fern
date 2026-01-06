using SeedAnyAuth.Core;

namespace SeedAnyAuth;

public partial interface IUserClient
{
    async Task<IEnumerable<User>> GetAsync(
        IRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    async Task<IEnumerable<User>> GetAdminsAsync(
        IRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
