<?php

namespace Seed\Problem;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Problem\Types\CreateProblemRequest;
use Seed\Problem\Types\CreateProblemResponse;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Environments;
use Seed\Core\Client\HttpMethod;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Problem\Types\UpdateProblemResponse;
use Seed\Problem\Requests\GetDefaultStarterFilesRequest;
use Seed\Problem\Types\GetDefaultStarterFilesResponse;

class ProblemClient
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
     * Creates a problem
     *
     * Example:
     * ```php
     * $client->problem->createProblem(
     *     new CreateProblemRequest([
     *         'problemName' => 'problemName',
     *         'problemDescription' => new ProblemDescription([
     *             'boards' => [
     *                 ProblemDescriptionBoard::html('boards'),
     *                 ProblemDescriptionBoard::html('boards'),
     *             ],
     *         ]),
     *         'files' => [
     *             Language::Java->value => new ProblemFiles([
     *                 'solutionFile' => new FileInfo([
     *                     'filename' => 'filename',
     *                     'contents' => 'contents',
     *                 ]),
     *                 'readOnlyFiles' => [
     *                     new FileInfo([
     *                         'filename' => 'filename',
     *                         'contents' => 'contents',
     *                     ]),
     *                     new FileInfo([
     *                         'filename' => 'filename',
     *                         'contents' => 'contents',
     *                     ]),
     *                 ],
     *             ]),
     *         ],
     *         'inputParams' => [
     *             new VariableTypeAndName([
     *                 'variableType' => VariableType::integerType(),
     *                 'name' => 'name',
     *             ]),
     *             new VariableTypeAndName([
     *                 'variableType' => VariableType::integerType(),
     *                 'name' => 'name',
     *             ]),
     *         ],
     *         'outputType' => VariableType::integerType(),
     *         'testcases' => [
     *             new TestCaseWithExpectedResult([
     *                 'testCase' => new TestCase([
     *                     'id' => 'id',
     *                     'params' => [
     *                         VariableValue::integerValue(1),
     *                         VariableValue::integerValue(1),
     *                     ],
     *                 ]),
     *                 'expectedResult' => VariableValue::integerValue(1),
     *             ]),
     *             new TestCaseWithExpectedResult([
     *                 'testCase' => new TestCase([
     *                     'id' => 'id',
     *                     'params' => [
     *                         VariableValue::integerValue(1),
     *                         VariableValue::integerValue(1),
     *                     ],
     *                 ]),
     *                 'expectedResult' => VariableValue::integerValue(1),
     *             ]),
     *         ],
     *         'methodName' => 'methodName',
     *     ]),
     * );
     * ```
     *
     * @param CreateProblemRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?CreateProblemResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function createProblem(CreateProblemRequest $request, ?array $options = null): ?CreateProblemResponse
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/problem-crud/create",
                    method: HttpMethod::POST,
                    body: $request,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return CreateProblemResponse::fromJson($json);
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

    /**
     * Updates a problem
     *
     * Example:
     * ```php
     * $client->problem->updateProblem(
     *     'problemId',
     *     new CreateProblemRequest([
     *         'problemName' => 'problemName',
     *         'problemDescription' => new ProblemDescription([
     *             'boards' => [
     *                 ProblemDescriptionBoard::html('boards'),
     *                 ProblemDescriptionBoard::html('boards'),
     *             ],
     *         ]),
     *         'files' => [
     *             Language::Java->value => new ProblemFiles([
     *                 'solutionFile' => new FileInfo([
     *                     'filename' => 'filename',
     *                     'contents' => 'contents',
     *                 ]),
     *                 'readOnlyFiles' => [
     *                     new FileInfo([
     *                         'filename' => 'filename',
     *                         'contents' => 'contents',
     *                     ]),
     *                     new FileInfo([
     *                         'filename' => 'filename',
     *                         'contents' => 'contents',
     *                     ]),
     *                 ],
     *             ]),
     *         ],
     *         'inputParams' => [
     *             new VariableTypeAndName([
     *                 'variableType' => VariableType::integerType(),
     *                 'name' => 'name',
     *             ]),
     *             new VariableTypeAndName([
     *                 'variableType' => VariableType::integerType(),
     *                 'name' => 'name',
     *             ]),
     *         ],
     *         'outputType' => VariableType::integerType(),
     *         'testcases' => [
     *             new TestCaseWithExpectedResult([
     *                 'testCase' => new TestCase([
     *                     'id' => 'id',
     *                     'params' => [
     *                         VariableValue::integerValue(1),
     *                         VariableValue::integerValue(1),
     *                     ],
     *                 ]),
     *                 'expectedResult' => VariableValue::integerValue(1),
     *             ]),
     *             new TestCaseWithExpectedResult([
     *                 'testCase' => new TestCase([
     *                     'id' => 'id',
     *                     'params' => [
     *                         VariableValue::integerValue(1),
     *                         VariableValue::integerValue(1),
     *                     ],
     *                 ]),
     *                 'expectedResult' => VariableValue::integerValue(1),
     *             ]),
     *         ],
     *         'methodName' => 'methodName',
     *     ]),
     * );
     * ```
     *
     * @param string $problemId
     * @param CreateProblemRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?UpdateProblemResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function updateProblem(string $problemId, CreateProblemRequest $request, ?array $options = null): ?UpdateProblemResponse
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/problem-crud/update/{$problemId}",
                    method: HttpMethod::POST,
                    body: $request,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return UpdateProblemResponse::fromJson($json);
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

    /**
     * Soft deletes a problem
     *
     * Example:
     * ```php
     * $client->problem->deleteProblem(
     *     'problemId',
     * );
     * ```
     *
     * @param string $problemId
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function deleteProblem(string $problemId, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/problem-crud/delete/{$problemId}",
                    method: HttpMethod::DELETE,
                ),
                $options,
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
     * Returns default starter files for problem
     *
     * Example:
     * ```php
     * $client->problem->getDefaultStarterFiles(
     *     new GetDefaultStarterFilesRequest([
     *         'inputParams' => [
     *             new VariableTypeAndName([
     *                 'variableType' => VariableType::integerType(),
     *                 'name' => 'name',
     *             ]),
     *             new VariableTypeAndName([
     *                 'variableType' => VariableType::integerType(),
     *                 'name' => 'name',
     *             ]),
     *         ],
     *         'outputType' => VariableType::integerType(),
     *         'methodName' => 'methodName',
     *     ]),
     * );
     * ```
     *
     * @param GetDefaultStarterFilesRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?GetDefaultStarterFilesResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getDefaultStarterFiles(GetDefaultStarterFilesRequest $request, ?array $options = null): ?GetDefaultStarterFilesResponse
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/problem-crud/default-starter-files",
                    method: HttpMethod::POST,
                    body: $request,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return GetDefaultStarterFilesResponse::fromJson($json);
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
