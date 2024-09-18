<?php

namespace Seed\PathParam;

use Seed\Core\RawClient;
use Seed\Types\Operand;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use Psr\Http\Client\ClientExceptionInterface;
use Exception;

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
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function send(Operand $operand, ?Operand $maybeOperand = null, mixed $operandOrColor, mixed $maybeOperandOrColor, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? '',
                    path: "path/$operand/$maybeOperand/$operandOrColor/$maybeOperandOrColor",
                    method: HttpMethod::POST,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
