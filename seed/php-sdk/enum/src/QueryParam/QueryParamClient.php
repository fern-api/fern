<?php

namespace Seed\QueryParam;

use Seed\Core\RawClient;
use Seed\QueryParam\Requests\SendEnumAsQueryParamRequest;
use Psr\Http\Client\ClientExceptionInterface;
use Exception;
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
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function send(SendEnumAsQueryParamRequest $request, ?array $options = null): mixed
    {
        $query = [];
        $query['operand'] = $request->operand->value;
        $query['operandOrColor'] = $request->operandOrColor;
        if ($request->maybeOperand != null) {
            $query['maybeOperand'] = $request->maybeOperand->value;
        }
        if ($request->maybeOperandOrColor != null) {
            $query['maybeOperandOrColor'] = $request->maybeOperandOrColor;
        }
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param SendEnumListAsQueryParamRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function sendList(SendEnumListAsQueryParamRequest $request, ?array $options = null): mixed
    {
        $query = [];
        $query['operand'] = $request->operand->value;
        $query['operandOrColor'] = $request->operandOrColor;
        if ($request->maybeOperand != null) {
            $query['maybeOperand'] = $request->maybeOperand->value;
        }
        if ($request->maybeOperandOrColor != null) {
            $query['maybeOperandOrColor'] = $request->maybeOperandOrColor;
        }
        try {
            $response = $this->client->sendRequest();
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
