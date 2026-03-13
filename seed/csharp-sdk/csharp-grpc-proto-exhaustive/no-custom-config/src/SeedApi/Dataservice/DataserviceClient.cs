using System.Text.Json;
using Data.V1.Grpc;
using Grpc.Core;
using SeedApi.Core;

namespace SeedApi;

public partial class DataserviceClient : IDataserviceClient
{
    private readonly RawClient _client;

    private readonly RawGrpcClient _grpc;

    private DataService.DataServiceClient _dataService;

    internal DataserviceClient(RawClient client)
    {
        _client = client;
        _grpc = _client.Grpc;
        _dataService = new DataService.DataServiceClient(_grpc.Channel);
    }

    private async Task<WithRawResponse<Dictionary<string, object?>>> FooAsyncCore(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
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
                    Path = "foo",
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
                var responseData = JsonUtils.Deserialize<Dictionary<string, object?>>(
                    responseBody
                )!;
                return new WithRawResponse<Dictionary<string, object?>>()
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
                throw new SeedApiApiException(
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
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Dataservice.FooAsync();
    /// </code></example>
    public WithRawResponseTask<Dictionary<string, object?>> FooAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Dictionary<string, object?>>(
            FooAsyncCore(options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Dataservice.UploadAsync(
    ///     new UploadRequest
    ///     {
    ///         Columns = new List&lt;SeedApi.Column&gt;()
    ///         {
    ///             new SeedApi.Column
    ///             {
    ///                 Id = "id",
    ///                 Values = new List&lt;float&gt;() { 1.1f },
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<UploadResponse> UploadAsync(
        UploadRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var metadata = new global::Grpc.Core.Metadata();
            foreach (var header in _client.Options.Headers)
            {
                var value = await header.Value.ResolveAsync().ConfigureAwait(false);
                metadata.Add(header.Key, value);
            }
            if (_client.Options.AdditionalHeaders != null)
            {
                foreach (var header in _client.Options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }
            if (options?.AdditionalHeaders != null)
            {
                foreach (var header in options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }

            var callOptions = _grpc.CreateCallOptions(
                metadata,
                options ?? new GrpcRequestOptions(),
                cancellationToken
            );
            var call = _dataService.UploadAsync(request.ToProto(), callOptions);
            var response = await call.ConfigureAwait(false);
            return UploadResponse.FromProto(response);
        }
        catch (RpcException rpc)
        {
            var statusCode = (int)rpc.StatusCode;
            throw new SeedApiApiException(
                $"Error with gRPC status code {statusCode}",
                statusCode,
                rpc.Message
            );
        }
        catch (Exception e)
        {
            throw new SeedApiException("Error", e);
        }
    }

    /// <example><code>
    /// await client.Dataservice.DeleteAsync(new DeleteRequest());
    /// </code></example>
    public async Task<DeleteResponse> DeleteAsync(
        DeleteRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var metadata = new global::Grpc.Core.Metadata();
            foreach (var header in _client.Options.Headers)
            {
                var value = await header.Value.ResolveAsync().ConfigureAwait(false);
                metadata.Add(header.Key, value);
            }
            if (_client.Options.AdditionalHeaders != null)
            {
                foreach (var header in _client.Options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }
            if (options?.AdditionalHeaders != null)
            {
                foreach (var header in options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }

            var callOptions = _grpc.CreateCallOptions(
                metadata,
                options ?? new GrpcRequestOptions(),
                cancellationToken
            );
            var call = _dataService.DeleteAsync(request.ToProto(), callOptions);
            var response = await call.ConfigureAwait(false);
            return DeleteResponse.FromProto(response);
        }
        catch (RpcException rpc)
        {
            var statusCode = (int)rpc.StatusCode;
            throw new SeedApiApiException(
                $"Error with gRPC status code {statusCode}",
                statusCode,
                rpc.Message
            );
        }
        catch (Exception e)
        {
            throw new SeedApiException("Error", e);
        }
    }

    /// <example><code>
    /// await client.Dataservice.DescribeAsync(new DescribeRequest());
    /// </code></example>
    public async Task<DescribeResponse> DescribeAsync(
        DescribeRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var metadata = new global::Grpc.Core.Metadata();
            foreach (var header in _client.Options.Headers)
            {
                var value = await header.Value.ResolveAsync().ConfigureAwait(false);
                metadata.Add(header.Key, value);
            }
            if (_client.Options.AdditionalHeaders != null)
            {
                foreach (var header in _client.Options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }
            if (options?.AdditionalHeaders != null)
            {
                foreach (var header in options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }

            var callOptions = _grpc.CreateCallOptions(
                metadata,
                options ?? new GrpcRequestOptions(),
                cancellationToken
            );
            var call = _dataService.DescribeAsync(request.ToProto(), callOptions);
            var response = await call.ConfigureAwait(false);
            return DescribeResponse.FromProto(response);
        }
        catch (RpcException rpc)
        {
            var statusCode = (int)rpc.StatusCode;
            throw new SeedApiApiException(
                $"Error with gRPC status code {statusCode}",
                statusCode,
                rpc.Message
            );
        }
        catch (Exception e)
        {
            throw new SeedApiException("Error", e);
        }
    }

    /// <example><code>
    /// await client.Dataservice.FetchAsync(new FetchRequest());
    /// </code></example>
    public async Task<FetchResponse> FetchAsync(
        FetchRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var metadata = new global::Grpc.Core.Metadata();
            foreach (var header in _client.Options.Headers)
            {
                var value = await header.Value.ResolveAsync().ConfigureAwait(false);
                metadata.Add(header.Key, value);
            }
            if (_client.Options.AdditionalHeaders != null)
            {
                foreach (var header in _client.Options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }
            if (options?.AdditionalHeaders != null)
            {
                foreach (var header in options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }

            var callOptions = _grpc.CreateCallOptions(
                metadata,
                options ?? new GrpcRequestOptions(),
                cancellationToken
            );
            var call = _dataService.FetchAsync(request.ToProto(), callOptions);
            var response = await call.ConfigureAwait(false);
            return FetchResponse.FromProto(response);
        }
        catch (RpcException rpc)
        {
            var statusCode = (int)rpc.StatusCode;
            throw new SeedApiApiException(
                $"Error with gRPC status code {statusCode}",
                statusCode,
                rpc.Message
            );
        }
        catch (Exception e)
        {
            throw new SeedApiException("Error", e);
        }
    }

    /// <example><code>
    /// await client.Dataservice.ListAsync(new ListRequest());
    /// </code></example>
    public async Task<ListResponse> ListAsync(
        ListRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var metadata = new global::Grpc.Core.Metadata();
            foreach (var header in _client.Options.Headers)
            {
                var value = await header.Value.ResolveAsync().ConfigureAwait(false);
                metadata.Add(header.Key, value);
            }
            if (_client.Options.AdditionalHeaders != null)
            {
                foreach (var header in _client.Options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }
            if (options?.AdditionalHeaders != null)
            {
                foreach (var header in options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }

            var callOptions = _grpc.CreateCallOptions(
                metadata,
                options ?? new GrpcRequestOptions(),
                cancellationToken
            );
            var call = _dataService.ListAsync(request.ToProto(), callOptions);
            var response = await call.ConfigureAwait(false);
            return ListResponse.FromProto(response);
        }
        catch (RpcException rpc)
        {
            var statusCode = (int)rpc.StatusCode;
            throw new SeedApiApiException(
                $"Error with gRPC status code {statusCode}",
                statusCode,
                rpc.Message
            );
        }
        catch (Exception e)
        {
            throw new SeedApiException("Error", e);
        }
    }

    /// <example><code>
    /// await client.Dataservice.QueryAsync(new QueryRequest { TopK = 1 });
    /// </code></example>
    public async Task<QueryResponse> QueryAsync(
        QueryRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var metadata = new global::Grpc.Core.Metadata();
            foreach (var header in _client.Options.Headers)
            {
                var value = await header.Value.ResolveAsync().ConfigureAwait(false);
                metadata.Add(header.Key, value);
            }
            if (_client.Options.AdditionalHeaders != null)
            {
                foreach (var header in _client.Options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }
            if (options?.AdditionalHeaders != null)
            {
                foreach (var header in options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }

            var callOptions = _grpc.CreateCallOptions(
                metadata,
                options ?? new GrpcRequestOptions(),
                cancellationToken
            );
            var call = _dataService.QueryAsync(request.ToProto(), callOptions);
            var response = await call.ConfigureAwait(false);
            return QueryResponse.FromProto(response);
        }
        catch (RpcException rpc)
        {
            var statusCode = (int)rpc.StatusCode;
            throw new SeedApiApiException(
                $"Error with gRPC status code {statusCode}",
                statusCode,
                rpc.Message
            );
        }
        catch (Exception e)
        {
            throw new SeedApiException("Error", e);
        }
    }

    /// <example><code>
    /// await client.Dataservice.UpdateAsync(new UpdateRequest { Id = "id" });
    /// </code></example>
    public async Task<UpdateResponse> UpdateAsync(
        UpdateRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var metadata = new global::Grpc.Core.Metadata();
            foreach (var header in _client.Options.Headers)
            {
                var value = await header.Value.ResolveAsync().ConfigureAwait(false);
                metadata.Add(header.Key, value);
            }
            if (_client.Options.AdditionalHeaders != null)
            {
                foreach (var header in _client.Options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }
            if (options?.AdditionalHeaders != null)
            {
                foreach (var header in options.AdditionalHeaders)
                {
                    if (header.Value != null)
                        metadata.Add(header.Key, header.Value);
                }
            }

            var callOptions = _grpc.CreateCallOptions(
                metadata,
                options ?? new GrpcRequestOptions(),
                cancellationToken
            );
            var call = _dataService.UpdateAsync(request.ToProto(), callOptions);
            var response = await call.ConfigureAwait(false);
            return UpdateResponse.FromProto(response);
        }
        catch (RpcException rpc)
        {
            var statusCode = (int)rpc.StatusCode;
            throw new SeedApiApiException(
                $"Error with gRPC status code {statusCode}",
                statusCode,
                rpc.Message
            );
        }
        catch (Exception e)
        {
            throw new SeedApiException("Error", e);
        }
    }
}
