<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Requests\ListAuditLogsRequest;
use Seed\Requests\CountAuditLogsRequest;
use Seed\Requests\UploadAuditLogRequest;
use Seed\Utils\File;

class WireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testListAuditLogs(): void {
        $testId = 'list_audit_logs.0';
        $this->client->listAuditLogs(
            new ListAuditLogsRequest([
                'offset' => 0,
                'includeResolved' => false,
                'filter' => '0',
                'xMaxResults' => 0,
                'xIncludeResolved' => false,
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'list_audit_logs.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/audit-logs",
            ['offset' => '0', 'includeResolved' => 'false', 'filter' => '0'],
            1
        );
    }

    /**
     */
    public function testCountAuditLogs(): void {
        $testId = 'count_audit_logs.0';
        $this->client->countAuditLogs(
            new CountAuditLogsRequest([
                'resolvedOnly' => false,
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'count_audit_logs.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/audit-logs/count",
            ['resolvedOnly' => 'false'],
            1
        );
    }

    /**
     */
    public function testUploadAuditLog(): void {
        $testId = 'upload_audit_log.0';
        $this->client->uploadAuditLog(
            new UploadAuditLogRequest([
                'file' => File::createFromString("example_file", "example_file"),
                'resolved' => false,
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'upload_audit_log.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/audit-logs/upload",
            null,
            1
        );
    }

    /**
     */
    protected function setUp(): void {
        parent::setUp();
        $wiremockUrl = getenv('WIREMOCK_URL') ?: 'http://localhost:8080';
        $this->client = new SeedClient(
            options: [
                'baseUrl' => $wiremockUrl,
            ]
        );
    }
}
