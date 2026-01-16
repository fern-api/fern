using SeedContentTypes.Core;

namespace SeedContentTypes;

public partial class ServiceClient : IServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public ServiceClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Service.PatchAsync(
    ///     new PatchProxyRequest { Application = "application", RequireAuth = true }
    /// );
    /// </code></example>
    public async Task PatchAsync(
        PatchProxyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethodExtensions.Patch,
                    Path = "",
                    Body = request,
                    ContentType = "application/merge-patch+json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedContentTypesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Update with JSON merge patch - complex types.
    /// This endpoint demonstrates the distinction between:
    /// - optional&lt;T&gt; fields (can be present or absent, but not null)
    /// - optional&lt;nullable&lt;T&gt;&gt; fields (can be present, absent, or null)
    /// </summary>
    /// <example><code>
    /// await client.Service.PatchComplexAsync(
    ///     "id",
    ///     new PatchComplexRequest
    ///     {
    ///         Name = "name",
    ///         Age = 1,
    ///         Active = true,
    ///         Metadata = new Dictionary&lt;string, object?&gt;()
    ///         {
    ///             {
    ///                 "metadata",
    ///                 new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    ///             },
    ///         },
    ///         Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///         Email = "email",
    ///         Nickname = "nickname",
    ///         Bio = "bio",
    ///         ProfileImageUrl = "profileImageUrl",
    ///         Settings = new Dictionary&lt;string, object?&gt;()
    ///         {
    ///             {
    ///                 "settings",
    ///                 new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task PatchComplexAsync(
        string id,
        PatchComplexRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethodExtensions.Patch,
                    Path = string.Format("complex/{0}", ValueConvert.ToPathParameterString(id)),
                    Body = request,
                    ContentType = "application/merge-patch+json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedContentTypesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Named request with mixed optional/nullable fields and merge-patch content type.
    /// This should trigger the NPE issue when optional fields aren't initialized.
    /// </summary>
    /// <example><code>
    /// await client.Service.NamedPatchWithMixedAsync(
    ///     "id",
    ///     new NamedMixedPatchRequest
    ///     {
    ///         AppId = "appId",
    ///         Instructions = "instructions",
    ///         Active = true,
    ///     }
    /// );
    /// </code></example>
    public async Task NamedPatchWithMixedAsync(
        string id,
        NamedMixedPatchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethodExtensions.Patch,
                    Path = string.Format("named-mixed/{0}", ValueConvert.ToPathParameterString(id)),
                    Body = request,
                    ContentType = "application/merge-patch+json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedContentTypesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
    /// This endpoint should:
    /// 1. Not NPE when fields are not provided (tests initialization)
    /// 2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
    /// </summary>
    /// <example><code>
    /// await client.Service.OptionalMergePatchTestAsync(
    ///     new OptionalMergePatchRequest
    ///     {
    ///         RequiredField = "requiredField",
    ///         OptionalString = "optionalString",
    ///         OptionalInteger = 1,
    ///         OptionalBoolean = true,
    ///         NullableString = "nullableString",
    ///     }
    /// );
    /// </code></example>
    public async Task OptionalMergePatchTestAsync(
        OptionalMergePatchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethodExtensions.Patch,
                    Path = "optional-merge-patch-test",
                    Body = request,
                    ContentType = "application/merge-patch+json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedContentTypesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Regular PATCH endpoint without merge-patch semantics
    /// </summary>
    /// <example><code>
    /// await client.Service.RegularPatchAsync(
    ///     "id",
    ///     new RegularPatchRequest { Field1 = "field1", Field2 = 1 }
    /// );
    /// </code></example>
    public async Task RegularPatchAsync(
        string id,
        RegularPatchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethodExtensions.Patch,
                    Path = string.Format("regular/{0}", ValueConvert.ToPathParameterString(id)),
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedContentTypesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(
            HttpResponseMessage response
        )
        {
            var headers = new Dictionary<string, IEnumerable<string>>(
                StringComparer.OrdinalIgnoreCase
            );
            foreach (var header in response.Headers)
            {
                headers[header.Key] = header.Value.ToList();
            }
            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    headers[header.Key] = header.Value.ToList();
                }
            }
            return headers;
        }

        public async Task<RawResponse<object>> PatchAsync(
            PatchProxyRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethodExtensions.Patch,
                        Path = "",
                        Body = request,
                        ContentType = "application/merge-patch+json",
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return new RawResponse<object>
                {
                    StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri!,
                    Headers = ExtractHeaders(response.Raw),
                    Body = new object(),
                };
            }
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedContentTypesApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        /// <summary>
        /// Update with JSON merge patch - complex types.
        /// This endpoint demonstrates the distinction between:
        /// - optional&lt;T&gt; fields (can be present or absent, but not null)
        /// - optional&lt;nullable&lt;T&gt;&gt; fields (can be present, absent, or null)
        /// </summary>
        public async Task<RawResponse<object>> PatchComplexAsync(
            string id,
            PatchComplexRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethodExtensions.Patch,
                        Path = string.Format("complex/{0}", ValueConvert.ToPathParameterString(id)),
                        Body = request,
                        ContentType = "application/merge-patch+json",
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return new RawResponse<object>
                {
                    StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri!,
                    Headers = ExtractHeaders(response.Raw),
                    Body = new object(),
                };
            }
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedContentTypesApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        /// <summary>
        /// Named request with mixed optional/nullable fields and merge-patch content type.
        /// This should trigger the NPE issue when optional fields aren't initialized.
        /// </summary>
        public async Task<RawResponse<object>> NamedPatchWithMixedAsync(
            string id,
            NamedMixedPatchRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethodExtensions.Patch,
                        Path = string.Format(
                            "named-mixed/{0}",
                            ValueConvert.ToPathParameterString(id)
                        ),
                        Body = request,
                        ContentType = "application/merge-patch+json",
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return new RawResponse<object>
                {
                    StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri!,
                    Headers = ExtractHeaders(response.Raw),
                    Body = new object(),
                };
            }
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedContentTypesApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        /// <summary>
        /// Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
        /// This endpoint should:
        /// 1. Not NPE when fields are not provided (tests initialization)
        /// 2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
        /// </summary>
        public async Task<RawResponse<object>> OptionalMergePatchTestAsync(
            OptionalMergePatchRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethodExtensions.Patch,
                        Path = "optional-merge-patch-test",
                        Body = request,
                        ContentType = "application/merge-patch+json",
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return new RawResponse<object>
                {
                    StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri!,
                    Headers = ExtractHeaders(response.Raw),
                    Body = new object(),
                };
            }
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedContentTypesApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        /// <summary>
        /// Regular PATCH endpoint without merge-patch semantics
        /// </summary>
        public async Task<RawResponse<object>> RegularPatchAsync(
            string id,
            RegularPatchRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethodExtensions.Patch,
                        Path = string.Format("regular/{0}", ValueConvert.ToPathParameterString(id)),
                        Body = request,
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return new RawResponse<object>
                {
                    StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri!,
                    Headers = ExtractHeaders(response.Raw),
                    Body = new object(),
                };
            }
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedContentTypesApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
