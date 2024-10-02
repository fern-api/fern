<?php

namespace Seed\QueryParam;

use Seed\Core\Client\RawClient;
use Seed\QueryParam\Requests\SendEnumAsQueryParamRequest;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\QueryParam\Requests\SendEnumListAsQueryParamRequest;

class QueryParamClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param RawClient $client
     */
    public function __construct(
        RawClient $client,
    ) {
        $this->client = $client;
    }

    /**
     * @param SendEnumAsQueryParamRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function send(SendEnumAsQueryParamRequest $request, ?array $options = null): void
    {
        $query = [];
        $query['operand'] = $request->operand;
        $query['operandOrColor'] = $request->operandOrColor;
        if ($request->maybeOperand != null) {
            $query['maybeOperand'] = $request->maybeOperand;
        }
        if ($request->maybeOperandOrColor != null) {
            $query['maybeOperandOrColor'] = $request->maybeOperandOrColor;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "query",
                    method: HttpMethod::POST,
                    query: $query,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * @param SendEnumListAsQueryParamRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function sendList(SendEnumListAsQueryParamRequest $request, ?array $options = null): void
    {
        $query = [];
        $query['operand'] = $request->operand;
        $query['operandOrColor'] = $request->operandOrColor;
        if ($request->maybeOperand != null) {
            $query['maybeOperand'] = $request->maybeOperand;
        }
        if ($request->maybeOperandOrColor != null) {
            $query['maybeOperandOrColor'] = $request->maybeOperandOrColor;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "query-list",
                    method: HttpMethod::POST,
                    query: $query,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
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
