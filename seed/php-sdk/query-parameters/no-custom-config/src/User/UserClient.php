<?php

namespace Seed\User;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\User\Requests\GetUsersRequest;
use Seed\User\Types\User;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonSerializer;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
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
    public function __construct(
        RawClient $client,
        ?array $options = null,
    ) {
        $this->client = $client;
        $this->options = $options ?? [];
    }

    /**
     * Example:
     * ```php
     * $client->user->getUsername(
     *     new GetUsersRequest([
     *         'limit' => 1,
     *         'id' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *         'date' => new DateTime('2023-01-15'),
     *         'deadline' => new DateTime('2024-01-15T09:30:00Z'),
     *         'bytes' => 'SGVsbG8gd29ybGQh',
     *         'user' => new User([
     *             'name' => 'name',
     *             'tags' => [
     *                 'tags',
     *                 'tags',
     *             ],
     *         ]),
     *         'userList' => [
     *             new User([
     *                 'name' => 'name',
     *                 'tags' => [
     *                     'tags',
     *                     'tags',
     *                 ],
     *             ]),
     *             new User([
     *                 'name' => 'name',
     *                 'tags' => [
     *                     'tags',
     *                     'tags',
     *                 ],
     *             ]),
     *         ],
     *         'optionalDeadline' => new DateTime('2024-01-15T09:30:00Z'),
     *         'keyValue' => [
     *             'keyValue' => 'keyValue',
     *         ],
     *         'optionalString' => 'optionalString',
     *         'nestedUser' => new NestedUser([
     *             'name' => 'name',
     *             'user' => new User([
     *                 'name' => 'name',
     *                 'tags' => [
     *                     'tags',
     *                     'tags',
     *                 ],
     *             ]),
     *         ]),
     *         'optionalUser' => new User([
     *             'name' => 'name',
     *             'tags' => [
     *                 'tags',
     *                 'tags',
     *             ],
     *         ]),
     *         'excludeUser' => [
     *             new User([
     *                 'name' => 'name',
     *                 'tags' => [
     *                     'tags',
     *                     'tags',
     *                 ],
     *             ]),
     *         ],
     *         'filter' => [
     *             'filter',
     *         ],
     *     ]),
     * );
     * ```
     *
     * @param GetUsersRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?User
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getUsername(GetUsersRequest $request, ?array $options = null): ?User
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        $query['limit'] = $request->limit;
        $query['id'] = $request->id;
        $query['date'] = JsonSerializer::serializeDate($request->date);
        $query['deadline'] = JsonSerializer::serializeDateTime($request->deadline);
        $query['bytes'] = $request->bytes;
        $query['user'] = $request->user;
        $query['userList'] = $request->userList;
        $query['keyValue'] = $request->keyValue;
        $query['nestedUser'] = $request->nestedUser;
        $query['excludeUser'] = $request->excludeUser;
        $query['filter'] = $request->filter;
        if ($request->optionalDeadline != null) {
            $query['optionalDeadline'] = JsonSerializer::serializeDateTime($request->optionalDeadline);
        }
        if ($request->optionalString != null) {
            $query['optionalString'] = $request->optionalString;
        }
        if ($request->optionalUser != null) {
            $query['optionalUser'] = $request->optionalUser;
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
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return User::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
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
