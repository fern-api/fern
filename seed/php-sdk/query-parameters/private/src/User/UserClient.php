<?php

namespace Seed\User;

use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\User\Requests\GetUsersRequest;
use Seed\User\Types\User;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Types\Constant;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Client\ClientExceptionInterface;

class UserClient 
{
    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options @phpstan-ignore-next-line Property is used in endpoint methods via HttpEndpointGenerator
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param RawClient $client
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    function __construct(
        RawClient $client,
        ?array $options = null,
    )
    {
        $this->client = $client;
        $this->options = $options ?? [];
    }

    /**
     * @param GetUsersRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return User
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getUsername(GetUsersRequest $request, ?array $options = null): User {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        $query['limit'] = $request->getLimit();
        $query['id'] = $request->getId();
        $query['date'] = $request->getDate()->format(Constant::DateFormat);
        $query['deadline'] = $request->getDeadline()->format(Constant::DateTimeFormat);
        $query['bytes'] = $request->getBytes();
        $query['user'] = $request->getUser();
        $query['userList'] = $request->getUserList();
        $query['keyValue'] = $request->getKeyValue();
        $query['nestedUser'] = $request->getNestedUser();
        $query['excludeUser'] = $request->getExcludeUser();
        $query['filter'] = $request->getFilter();
        if ($request->getOptionalDeadline() != null){
            $query['optionalDeadline'] = $request->getOptionalDeadline()->format(Constant::DateTimeFormat);
        }
        if ($request->getOptionalString() != null){
            $query['optionalString'] = $request->getOptionalString();
        }
        if ($request->getOptionalUser() != null){
            $query['optionalUser'] = $request->getOptionalUser();
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/user",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return User::fromJson($json);
            }
            } catch (JsonException $e) {
                throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }
}
