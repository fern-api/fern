using Data.V1.Grpc;
using Grpc.Core;
using SeedApi.Core;

namespace SeedApi;

public partial class DataServiceClient : IDataServiceClient
{
    private readonly RawClient _client;

    private readonly RawGrpcClient _grpc;

    private DataService.DataServiceClient _dataService;

    internal DataServiceClient(RawClient client)
    {
        try
        {
            _client = client;
            _grpc = _client.Grpc;
            _dataService = new DataService.DataServiceClient(_grpc.Channel);
        }
        catch (Exception ex)
        {
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    /// <example><code>
    /// await client.DataService.UploadAsync(
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
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.DataService.DeleteAsync(new DeleteRequest());
    /// </code></example>
    public async Task<DeleteResponse> DeleteAsync(
        DeleteRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.DataService.DescribeAsync(new DescribeRequest());
    /// </code></example>
    public async Task<DescribeResponse> DescribeAsync(
        DescribeRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.DataService.FetchAsync(new FetchRequest());
    /// </code></example>
    public async Task<FetchResponse> FetchAsync(
        FetchRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.DataService.ListAsync(new ListRequest());
    /// </code></example>
    public async Task<ListResponse> ListAsync(
        ListRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.DataService.QueryAsync(new QueryRequest { TopK = 1 });
    /// </code></example>
    public async Task<QueryResponse> QueryAsync(
        QueryRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.DataService.UpdateAsync(new UpdateRequest { Id = "id" });
    /// </code></example>
    public async Task<UpdateResponse> UpdateAsync(
        UpdateRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
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
            })
            .ConfigureAwait(false);
    }
}
