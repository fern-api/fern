<?php

namespace Seed\Oauth;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Oauth\Requests\AuthorizeRequest;
use Seed\Types\AuthorizeResponse;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;

class OauthClient
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
     * Authorization-code grant with PKCE. `response_type` is a required literal that is
     * hardcoded by the generated method; `code_challenge_method` is an optional literal
     * that must still be sent on the wire when provided.
     *
     * Example:
     * ```php
     * $client->oauth->authorize(
     *     new AuthorizeRequest([
     *         'responseType' => 'code',
     *         'clientId' => 'client_abc123',
     *         'redirectUri' => 'https://example.com/callback',
     *         'codeChallenge' => 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
     *         'codeChallengeMethod' => 'S256',
     *         'scope' => 'read write',
     *         'state' => 'xyz',
     *     ]),
     * );
     * ```
     *
     * @param AuthorizeRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?AuthorizeResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function authorize(AuthorizeRequest $request, ?array $options = null): ?AuthorizeResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        $query['response_type'] = 'code';
        $query['client_id'] = $request->clientId;
        $query['redirect_uri'] = $request->redirectUri;
        $query['code_challenge'] = $request->codeChallenge;
        if ($request->codeChallengeMethod != null) {
            $query['code_challenge_method'] = $request->codeChallengeMethod;
        }
        if ($request->scope != null) {
            $query['scope'] = $request->scope;
        }
        if ($request->state != null) {
            $query['state'] = $request->state;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "oauth/authorize",
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
                return AuthorizeResponse::fromJson($json);
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
