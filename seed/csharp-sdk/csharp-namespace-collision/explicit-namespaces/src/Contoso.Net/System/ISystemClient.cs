using global::Contoso.Net;

namespace Contoso.Net.System;

public partial interface ISystemClient
{
    WithRawResponseTask<SystemUser> CreateuserAsync(
        SystemUser request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<SystemTask> CreatetaskAsync(
        SystemTask request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<SystemUser> GetuserAsync(
        SystemGetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
