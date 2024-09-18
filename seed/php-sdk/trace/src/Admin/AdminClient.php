<?php

namespace Seed\Admin;

use Seed\Core\RawClient;
use Psr\Http\Client\ClientExceptionInterface;
use Exception;
use Seed\Submission\Types\TestSubmissionUpdate;
use Seed\Submission\Types\WorkspaceSubmissionUpdate;
use Seed\Admin\Requests\StoreTracedTestCaseRequest;
use Seed\Submission\Types\TraceResponseV2;
use Seed\Admin\Requests\StoreTracedWorkspaceRequest;

class AdminClient
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
     * @param string submissionId
     * @param mixed request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function updateTestSubmissionStatus(string $submissionId, mixed $request, ?array $options = null): mixed
    {
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
     * @param string submissionId
     * @param TestSubmissionUpdate request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function sendTestSubmissionUpdate(string $submissionId, TestSubmissionUpdate $request, ?array $options = null): mixed
    {
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
     * @param string submissionId
     * @param mixed request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function updateWorkspaceSubmissionStatus(string $submissionId, mixed $request, ?array $options = null): mixed
    {
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
     * @param string submissionId
     * @param WorkspaceSubmissionUpdate request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function sendWorkspaceSubmissionUpdate(string $submissionId, WorkspaceSubmissionUpdate $request, ?array $options = null): mixed
    {
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
     * @param string submissionId
     * @param string testCaseId
     * @param StoreTracedTestCaseRequest request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function storeTracedTestCase(string $submissionId, string $testCaseId, StoreTracedTestCaseRequest $request, ?array $options = null): mixed
    {
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
     * @param string submissionId
     * @param string testCaseId
     * @param array<TraceResponseV2> request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function storeTracedTestCaseV2(string $submissionId, string $testCaseId, array $request, ?array $options = null): mixed
    {
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
     * @param string submissionId
     * @param StoreTracedWorkspaceRequest request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function storeTracedWorkspace(string $submissionId, StoreTracedWorkspaceRequest $request, ?array $options = null): mixed
    {
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
     * @param string submissionId
     * @param array<TraceResponseV2> request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function storeTracedWorkspaceV2(string $submissionId, array $request, ?array $options = null): mixed
    {
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
