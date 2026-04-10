using global::Contoso.Net;
using global::Contoso.Net.Core;
using global::System.Text.Json;

namespace Contoso.Net.System;

public partial class SystemClient : ISystemClient
{
    private readonly RawClient _client;

    internal SystemClient(RawClient client)
    {
        _client = client;
    }

    private async global::System.Threading.Tasks.Task<
        WithRawResponse<SystemUser>
    > CreateuserAsyncCore(
        SystemUser request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new global::Contoso.Net.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "users",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<SystemUser>(responseBody)!;
                return new WithRawResponse<SystemUser>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new ContosoApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new ContosoApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async global::System.Threading.Tasks.Task<
        WithRawResponse<SystemTask>
    > CreatetaskAsyncCore(
        SystemTask request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new global::Contoso.Net.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "users/tasks",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<SystemTask>(responseBody)!;
                return new WithRawResponse<SystemTask>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new ContosoApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new ContosoApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async global::System.Threading.Tasks.Task<WithRawResponse<SystemUser>> GetuserAsyncCore(
        SystemGetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new global::Contoso.Net.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "users/{0}",
                        ValueConvert.ToPathParameterString(request.UserId)
                    ),
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<SystemUser>(responseBody)!;
                return new WithRawResponse<SystemUser>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new ContosoApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new ContosoApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.System.CreateuserAsync(
    ///     new SystemUser
    ///     {
    ///         Line1 = "line1",
    ///         City = "city",
    ///         State = "state",
    ///         Zip = "zip",
    ///         Country = SystemUserCountry.Usa,
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<SystemUser> CreateuserAsync(
        SystemUser request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<SystemUser>(
            CreateuserAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.System.CreatetaskAsync(
    ///     new SystemTask
    ///     {
    ///         Name = "name",
    ///         User = new SystemUser
    ///         {
    ///             Line1 = "line1",
    ///             City = "city",
    ///             State = "state",
    ///             Zip = "zip",
    ///             Country = SystemUserCountry.Usa,
    ///         },
    ///         Owner = new SystemUser
    ///         {
    ///             Line1 = "line1",
    ///             City = "city",
    ///             State = "state",
    ///             Zip = "zip",
    ///             Country = SystemUserCountry.Usa,
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<SystemTask> CreatetaskAsync(
        SystemTask request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<SystemTask>(
            CreatetaskAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.System.GetuserAsync(new SystemGetUserRequest { UserId = "userId" });
    /// </code></example>
    public WithRawResponseTask<SystemUser> GetuserAsync(
        SystemGetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<SystemUser>(
            GetuserAsyncCore(request, options, cancellationToken)
        );
    }
}
