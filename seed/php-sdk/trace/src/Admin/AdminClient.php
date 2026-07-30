<?php

namespace Seed\Admin;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Submission\Types\TestSubmissionStatus;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Environments;
use Seed\Core\Client\HttpMethod;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Submission\Types\TestSubmissionUpdate;
use Seed\Submission\Types\WorkspaceSubmissionStatus;
use Seed\Submission\Types\WorkspaceSubmissionUpdate;
use Seed\Admin\Requests\StoreTracedTestCaseRequest;
use Seed\Submission\Types\TraceResponseV2;
use Seed\Core\Json\JsonSerializer;
use Seed\Admin\Requests\StoreTracedWorkspaceRequest;

class AdminClient
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
     * $client->admin->updateTestSubmissionStatus(
     *     'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *     TestSubmissionStatus::stopped(),
     * );
     * ```
     *
     * @param string $submissionId
     * @param TestSubmissionStatus $request
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
    public function updateTestSubmissionStatus(string $submissionId, TestSubmissionStatus $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/admin/store-test-submission-status/" . RawClient::encodePathParam($submissionId),
                    method: HttpMethod::POST,
                    body: $request,
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
     * Example:
     * ```php
     * $client->admin->sendTestSubmissionUpdate(
     *     'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *     new TestSubmissionUpdate([
     *         'updateTime' => new DateTime('2024-01-15T09:30:00Z'),
     *         'updateInfo' => TestSubmissionUpdateInfo::running(RunningSubmissionState::QueueingSubmission),
     *     ]),
     * );
     * ```
     *
     * @param string $submissionId
     * @param TestSubmissionUpdate $request
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
    public function sendTestSubmissionUpdate(string $submissionId, TestSubmissionUpdate $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/admin/store-test-submission-status-v2/" . RawClient::encodePathParam($submissionId),
                    method: HttpMethod::POST,
                    body: $request,
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
     * Example:
     * ```php
     * $client->admin->updateWorkspaceSubmissionStatus(
     *     'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *     WorkspaceSubmissionStatus::stopped(),
     * );
     * ```
     *
     * @param string $submissionId
     * @param WorkspaceSubmissionStatus $request
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
    public function updateWorkspaceSubmissionStatus(string $submissionId, WorkspaceSubmissionStatus $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/admin/store-workspace-submission-status/" . RawClient::encodePathParam($submissionId),
                    method: HttpMethod::POST,
                    body: $request,
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
     * Example:
     * ```php
     * $client->admin->sendWorkspaceSubmissionUpdate(
     *     'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *     new WorkspaceSubmissionUpdate([
     *         'updateTime' => new DateTime('2024-01-15T09:30:00Z'),
     *         'updateInfo' => WorkspaceSubmissionUpdateInfo::running(RunningSubmissionState::QueueingSubmission),
     *     ]),
     * );
     * ```
     *
     * @param string $submissionId
     * @param WorkspaceSubmissionUpdate $request
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
    public function sendWorkspaceSubmissionUpdate(string $submissionId, WorkspaceSubmissionUpdate $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/admin/store-workspace-submission-status-v2/" . RawClient::encodePathParam($submissionId),
                    method: HttpMethod::POST,
                    body: $request,
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
     * Example:
     * ```php
     * $client->admin->storeTracedTestCase(
     *     'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *     'testCaseId',
     *     new StoreTracedTestCaseRequest([
     *         'result' => new TestCaseResultWithStdout([
     *             'result' => new TestCaseResult([
     *                 'expectedResult' => VariableValue::integerValue(1),
     *                 'actualResult' => ActualResult::value(VariableValue::integerValue(1)),
     *                 'passed' => true,
     *             ]),
     *             'stdout' => 'stdout',
     *         ]),
     *         'traceResponses' => [
     *             new TraceResponse([
     *                 'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *                 'lineNumber' => 1,
     *                 'returnValue' => DebugVariableValue::integerValue(1),
     *                 'expressionLocation' => new ExpressionLocation([
     *                     'start' => 1,
     *                     'offset' => 1,
     *                 ]),
     *                 'stack' => new StackInformation([
     *                     'numStackFrames' => 1,
     *                     'topStackFrame' => new StackFrame([
     *                         'methodName' => 'methodName',
     *                         'lineNumber' => 1,
     *                         'scopes' => [
     *                             new Scope([
     *                                 'variables' => [
     *                                     'variables' => DebugVariableValue::integerValue(1),
     *                                 ],
     *                             ]),
     *                             new Scope([
     *                                 'variables' => [
     *                                     'variables' => DebugVariableValue::integerValue(1),
     *                                 ],
     *                             ]),
     *                         ],
     *                     ]),
     *                 ]),
     *                 'stdout' => 'stdout',
     *             ]),
     *             new TraceResponse([
     *                 'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *                 'lineNumber' => 1,
     *                 'returnValue' => DebugVariableValue::integerValue(1),
     *                 'expressionLocation' => new ExpressionLocation([
     *                     'start' => 1,
     *                     'offset' => 1,
     *                 ]),
     *                 'stack' => new StackInformation([
     *                     'numStackFrames' => 1,
     *                     'topStackFrame' => new StackFrame([
     *                         'methodName' => 'methodName',
     *                         'lineNumber' => 1,
     *                         'scopes' => [
     *                             new Scope([
     *                                 'variables' => [
     *                                     'variables' => DebugVariableValue::integerValue(1),
     *                                 ],
     *                             ]),
     *                             new Scope([
     *                                 'variables' => [
     *                                     'variables' => DebugVariableValue::integerValue(1),
     *                                 ],
     *                             ]),
     *                         ],
     *                     ]),
     *                 ]),
     *                 'stdout' => 'stdout',
     *             ]),
     *         ],
     *     ]),
     * );
     * ```
     *
     * @param string $submissionId
     * @param string $testCaseId
     * @param StoreTracedTestCaseRequest $request
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
    public function storeTracedTestCase(string $submissionId, string $testCaseId, StoreTracedTestCaseRequest $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/admin/store-test-trace/submission/" . RawClient::encodePathParam($submissionId) . "/testCase/" . RawClient::encodePathParam($testCaseId),
                    method: HttpMethod::POST,
                    body: $request,
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
     * Example:
     * ```php
     * $client->admin->storeTracedTestCaseV2(
     *     'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *     'testCaseId',
     *     [
     *         new TraceResponseV2([
     *             'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *             'lineNumber' => 1,
     *             'file' => new TracedFile([
     *                 'filename' => 'filename',
     *                 'directory' => 'directory',
     *             ]),
     *             'returnValue' => DebugVariableValue::integerValue(1),
     *             'expressionLocation' => new ExpressionLocation([
     *                 'start' => 1,
     *                 'offset' => 1,
     *             ]),
     *             'stack' => new StackInformation([
     *                 'numStackFrames' => 1,
     *                 'topStackFrame' => new StackFrame([
     *                     'methodName' => 'methodName',
     *                     'lineNumber' => 1,
     *                     'scopes' => [
     *                         new Scope([
     *                             'variables' => [
     *                                 'variables' => DebugVariableValue::integerValue(1),
     *                             ],
     *                         ]),
     *                         new Scope([
     *                             'variables' => [
     *                                 'variables' => DebugVariableValue::integerValue(1),
     *                             ],
     *                         ]),
     *                     ],
     *                 ]),
     *             ]),
     *             'stdout' => 'stdout',
     *         ]),
     *         new TraceResponseV2([
     *             'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *             'lineNumber' => 1,
     *             'file' => new TracedFile([
     *                 'filename' => 'filename',
     *                 'directory' => 'directory',
     *             ]),
     *             'returnValue' => DebugVariableValue::integerValue(1),
     *             'expressionLocation' => new ExpressionLocation([
     *                 'start' => 1,
     *                 'offset' => 1,
     *             ]),
     *             'stack' => new StackInformation([
     *                 'numStackFrames' => 1,
     *                 'topStackFrame' => new StackFrame([
     *                     'methodName' => 'methodName',
     *                     'lineNumber' => 1,
     *                     'scopes' => [
     *                         new Scope([
     *                             'variables' => [
     *                                 'variables' => DebugVariableValue::integerValue(1),
     *                             ],
     *                         ]),
     *                         new Scope([
     *                             'variables' => [
     *                                 'variables' => DebugVariableValue::integerValue(1),
     *                             ],
     *                         ]),
     *                     ],
     *                 ]),
     *             ]),
     *             'stdout' => 'stdout',
     *         ]),
     *     ],
     * );
     * ```
     *
     * @param string $submissionId
     * @param string $testCaseId
     * @param array<TraceResponseV2> $request
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
    public function storeTracedTestCaseV2(string $submissionId, string $testCaseId, array $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/admin/store-test-trace-v2/submission/" . RawClient::encodePathParam($submissionId) . "/testCase/" . RawClient::encodePathParam($testCaseId),
                    method: HttpMethod::POST,
                    body: JsonSerializer::serializeArray($request, [TraceResponseV2::class]),
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
     * Example:
     * ```php
     * $client->admin->storeTracedWorkspace(
     *     'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *     new StoreTracedWorkspaceRequest([
     *         'workspaceRunDetails' => new WorkspaceRunDetails([
     *             'exceptionV2' => ExceptionV2::generic(new ExceptionInfo([
     *                 'exceptionType' => 'exceptionType',
     *                 'exceptionMessage' => 'exceptionMessage',
     *                 'exceptionStacktrace' => 'exceptionStacktrace',
     *             ])),
     *             'exception' => new ExceptionInfo([
     *                 'exceptionType' => 'exceptionType',
     *                 'exceptionMessage' => 'exceptionMessage',
     *                 'exceptionStacktrace' => 'exceptionStacktrace',
     *             ]),
     *             'stdout' => 'stdout',
     *         ]),
     *         'traceResponses' => [
     *             new TraceResponse([
     *                 'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *                 'lineNumber' => 1,
     *                 'returnValue' => DebugVariableValue::integerValue(1),
     *                 'expressionLocation' => new ExpressionLocation([
     *                     'start' => 1,
     *                     'offset' => 1,
     *                 ]),
     *                 'stack' => new StackInformation([
     *                     'numStackFrames' => 1,
     *                     'topStackFrame' => new StackFrame([
     *                         'methodName' => 'methodName',
     *                         'lineNumber' => 1,
     *                         'scopes' => [
     *                             new Scope([
     *                                 'variables' => [
     *                                     'variables' => DebugVariableValue::integerValue(1),
     *                                 ],
     *                             ]),
     *                             new Scope([
     *                                 'variables' => [
     *                                     'variables' => DebugVariableValue::integerValue(1),
     *                                 ],
     *                             ]),
     *                         ],
     *                     ]),
     *                 ]),
     *                 'stdout' => 'stdout',
     *             ]),
     *             new TraceResponse([
     *                 'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *                 'lineNumber' => 1,
     *                 'returnValue' => DebugVariableValue::integerValue(1),
     *                 'expressionLocation' => new ExpressionLocation([
     *                     'start' => 1,
     *                     'offset' => 1,
     *                 ]),
     *                 'stack' => new StackInformation([
     *                     'numStackFrames' => 1,
     *                     'topStackFrame' => new StackFrame([
     *                         'methodName' => 'methodName',
     *                         'lineNumber' => 1,
     *                         'scopes' => [
     *                             new Scope([
     *                                 'variables' => [
     *                                     'variables' => DebugVariableValue::integerValue(1),
     *                                 ],
     *                             ]),
     *                             new Scope([
     *                                 'variables' => [
     *                                     'variables' => DebugVariableValue::integerValue(1),
     *                                 ],
     *                             ]),
     *                         ],
     *                     ]),
     *                 ]),
     *                 'stdout' => 'stdout',
     *             ]),
     *         ],
     *     ]),
     * );
     * ```
     *
     * @param string $submissionId
     * @param StoreTracedWorkspaceRequest $request
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
    public function storeTracedWorkspace(string $submissionId, StoreTracedWorkspaceRequest $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/admin/store-workspace-trace/submission/" . RawClient::encodePathParam($submissionId),
                    method: HttpMethod::POST,
                    body: $request,
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
     * Example:
     * ```php
     * $client->admin->storeTracedWorkspaceV2(
     *     'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *     [
     *         new TraceResponseV2([
     *             'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *             'lineNumber' => 1,
     *             'file' => new TracedFile([
     *                 'filename' => 'filename',
     *                 'directory' => 'directory',
     *             ]),
     *             'returnValue' => DebugVariableValue::integerValue(1),
     *             'expressionLocation' => new ExpressionLocation([
     *                 'start' => 1,
     *                 'offset' => 1,
     *             ]),
     *             'stack' => new StackInformation([
     *                 'numStackFrames' => 1,
     *                 'topStackFrame' => new StackFrame([
     *                     'methodName' => 'methodName',
     *                     'lineNumber' => 1,
     *                     'scopes' => [
     *                         new Scope([
     *                             'variables' => [
     *                                 'variables' => DebugVariableValue::integerValue(1),
     *                             ],
     *                         ]),
     *                         new Scope([
     *                             'variables' => [
     *                                 'variables' => DebugVariableValue::integerValue(1),
     *                             ],
     *                         ]),
     *                     ],
     *                 ]),
     *             ]),
     *             'stdout' => 'stdout',
     *         ]),
     *         new TraceResponseV2([
     *             'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
     *             'lineNumber' => 1,
     *             'file' => new TracedFile([
     *                 'filename' => 'filename',
     *                 'directory' => 'directory',
     *             ]),
     *             'returnValue' => DebugVariableValue::integerValue(1),
     *             'expressionLocation' => new ExpressionLocation([
     *                 'start' => 1,
     *                 'offset' => 1,
     *             ]),
     *             'stack' => new StackInformation([
     *                 'numStackFrames' => 1,
     *                 'topStackFrame' => new StackFrame([
     *                     'methodName' => 'methodName',
     *                     'lineNumber' => 1,
     *                     'scopes' => [
     *                         new Scope([
     *                             'variables' => [
     *                                 'variables' => DebugVariableValue::integerValue(1),
     *                             ],
     *                         ]),
     *                         new Scope([
     *                             'variables' => [
     *                                 'variables' => DebugVariableValue::integerValue(1),
     *                             ],
     *                         ]),
     *                     ],
     *                 ]),
     *             ]),
     *             'stdout' => 'stdout',
     *         ]),
     *     ],
     * );
     * ```
     *
     * @param string $submissionId
     * @param array<TraceResponseV2> $request
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
    public function storeTracedWorkspaceV2(string $submissionId, array $request, ?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/admin/store-workspace-trace-v2/submission/" . RawClient::encodePathParam($submissionId),
                    method: HttpMethod::POST,
                    body: JsonSerializer::serializeArray($request, [TraceResponseV2::class]),
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
}
