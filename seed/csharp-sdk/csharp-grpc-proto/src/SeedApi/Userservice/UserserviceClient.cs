using System.Threading;
using Grpc.Core;
using SeedApi.Core;
using User.V1;

namespace SeedApi;

public partial class UserserviceClient
{
    private RawClient _client;

    private RawGrpcClient _grpc;

    private UserService.UserServiceClient _userService;

    internal UserserviceClient(RawClient client)
    {
        _client = client;
        _grpc = _client.Grpc;
        _userService = new UserService.UserServiceClient(_grpc.Channel);
    }

    /// <example>
    /// <code>
    /// await client.Userservice.CreateAsync(new CreateRequest());
    /// </code>
    /// </example>
    public async Task<CreateResponse> CreateAsync(
        CreateRequest request,
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
            var call = _userService.CreateAsync(request.ToProto(), callOptions);
            var response = await call.ConfigureAwait(false);
            return CreateResponse.FromProto(response);
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
