<?php

namespace Seed;

use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Requests\SearchRequest;
use Seed\Types\SearchResponse;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonSerializer;
use Seed\Core\Types\Union;
use Seed\Types\User;
use Seed\Types\NestedUser;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Client\ClientExceptionInterface;

class SeedClient 
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
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?array $options = null,
    )
    {
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];
        
        $this->options = $options ?? [];
        
        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );
        
        $this->client = new RawClient(
            options: $this->options,
        );
    }

    /**
     * @param SearchRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return SearchResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function search(SearchRequest $request, ?array $options = null): SearchResponse {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        $query['limit'] = $request->limit;
        $query['id'] = $request->id;
        $query['date'] = JsonSerializer::serializeDate($request->date);
        $query['deadline'] = JsonSerializer::serializeDateTime($request->deadline);
        $query['bytes'] = $request->bytes;
        $query['user'] = $request->user;
        $query['neighborRequired'] = JsonSerializer::serializeUnion($request->neighborRequired, new Union(User::class, NestedUser::class, 'string', 'integer'));
        if ($request->userList != null){
            $query['userList'] = $request->userList;
        }
        if ($request->optionalDeadline != null){
            $query['optionalDeadline'] = JsonSerializer::serializeDateTime($request->optionalDeadline);
        }
        if ($request->keyValue != null){
            $query['keyValue'] = $request->keyValue;
        }
        if ($request->optionalString != null){
            $query['optionalString'] = $request->optionalString;
        }
        if ($request->nestedUser != null){
            $query['nestedUser'] = $request->nestedUser;
        }
        if ($request->optionalUser != null){
            $query['optionalUser'] = $request->optionalUser;
        }
        if ($request->excludeUser != null){
            $query['excludeUser'] = $request->excludeUser;
        }
        if ($request->filter != null){
            $query['filter'] = $request->filter;
        }
        if ($request->neighbor != null){
            $query['neighbor'] = JsonSerializer::serializeUnion($request->neighbor, new Union(User::class, NestedUser::class, 'string', 'integer'));
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "user/getUsername",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return SearchResponse::fromJson($json);
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
