using System.Net.Http;
using System.Text.Json;
using System.Threading;
using Data.V1.Grpc;
using Grpc.Core;
using SeedApi.Core;

namespace SeedApi;

public partial class DataserviceClient
{
    private RawClient _client;

    private RawGrpcClient _grpc;

    private DataService.DataServiceClient _dataService;

    internal DataserviceClient(RawClient client)
    {
        _client = client;
        _grpc = _client.Grpc;
        _dataService = new DataService.DataServiceClient(_grpc.Channel);
    }

    /// <example>
    /// <code>
    /// await client.Dataservice.FooAsync();
    /// </code>
    /// </example>
    public async Task<object> FooAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "foo",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<object>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedApiException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example>
    /// <code>
    /// await client.Dataservice.UploadAsync(
    ///     new UploadRequest
    ///     {
    ///         Columns = new List&lt;Column&gt;()
    ///         {
    ///             new Column { Id = "id", Values = new[] { 1.1f } },
    ///         },
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<UploadResponse> UploadAsync(
        UploadRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var callOptions = _grpc.CreateCallOptions(
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

    /// <example>
    /// <code>
    /// await client.Dataservice.DeleteAsync(new DeleteRequest());
    /// </code>
    /// </example>
    public async Task<DeleteResponse> DeleteAsync(
        DeleteRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var callOptions = _grpc.CreateCallOptions(
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

    /// <example>
    /// <code>
    /// await client.Dataservice.DescribeAsync(new DescribeRequest());
    /// </code>
    /// </example>
    public async Task<DescribeResponse> DescribeAsync(
        DescribeRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var callOptions = _grpc.CreateCallOptions(
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

    /// <example>
    /// <code>
    /// await client.Dataservice.FetchAsync(new FetchRequest());
    /// </code>
    /// </example>
    public async Task<FetchResponse> FetchAsync(
        FetchRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var callOptions = _grpc.CreateCallOptions(
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

    /// <example>
    /// <code>
    /// await client.Dataservice.ListAsync(new ListRequest());
    /// </code>
    /// </example>
    public async Task<ListResponse> ListAsync(
        ListRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var callOptions = _grpc.CreateCallOptions(
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

    /// <example>
    /// <code>
    /// await client.Dataservice.QueryAsync(new QueryRequest { TopK = 1 });
    /// </code>
    /// </example>
    public async Task<QueryResponse> QueryAsync(
        QueryRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var callOptions = _grpc.CreateCallOptions(
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

    /// <example>
    /// <code>
    /// await client.Dataservice.UpdateAsync(new UpdateRequest { Id = "id" });
    /// </code>
    /// </example>
    public async Task<UpdateResponse> UpdateAsync(
        UpdateRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var callOptions = _grpc.CreateCallOptions(
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
