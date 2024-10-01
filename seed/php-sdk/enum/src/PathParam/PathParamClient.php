<?php

namespace Seed\PathParam;

use Seed\Core\RawClient;
use Seed\Types\Operand;
use Seed\Types\Color;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use Psr\Http\Client\ClientExceptionInterface;

class PathParamClient
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
     * @param value-of<Operand> $operand
     * @param ?value-of<Operand> $maybeOperand
     * @param value-of<Color>|value-of<Operand> $operandOrColor
     * @param value-of<Color>|value-of<Operand>|null $maybeOperandOrColor
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function send(string $operand, ?string $maybeOperand = null, string $operandOrColor, string|null $maybeOperandOrColor = null, ?array $options = null): void
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "path/$operand/$maybeOperand/$operandOrColor/$maybeOperandOrColor",
                    method: HttpMethod::POST,
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
