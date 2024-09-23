<?php

namespace Seed\PathParam;

use Seed\Core\RawClient;
use Seed\Types\Operand;
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
     * @param Operand $operand
     * @param ?Operand $maybeOperand
     * @param mixed $operandOrColor
     * @param mixed $maybeOperandOrColor
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function send(Operand $operand, ?Operand $maybeOperand = null, mixed $operandOrColor, mixed $maybeOperandOrColor, ?array $options = null): void
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "path/$operand/$maybeOperand/$operandOrColor/$maybeOperandOrColor",
                    method: HttpMethod::POST,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new SeedException($e->getMessage());
        }
        throw new SeedApiException("API request failed", $statusCode, $response->getBody()->getContents());
    }
}
