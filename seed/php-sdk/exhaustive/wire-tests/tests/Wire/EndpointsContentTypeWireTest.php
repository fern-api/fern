<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\TypesObjectWithOptionalField;

class EndpointsContentTypeWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testEndpointsContentTypePostJsonPatchContentType(): void {
        $testId = 'endpoints_content_type.endpoints_content_type_post_json_patch_content_type.0';
        $this->client->endpointsContentType->endpointsContentTypePostJsonPatchContentType(
            new TypesObjectWithOptionalField([]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_content_type.endpoints_content_type_post_json_patch_content_type.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo/bar",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsContentTypePostJsonPatchContentWithCharsetType(): void {
        $testId = 'endpoints_content_type.endpoints_content_type_post_json_patch_content_with_charset_type.0';
        $this->client->endpointsContentType->endpointsContentTypePostJsonPatchContentWithCharsetType(
            new TypesObjectWithOptionalField([]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_content_type.endpoints_content_type_post_json_patch_content_with_charset_type.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo/baz",
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
            token: 'test-token',
        options: [
            'baseUrl' => $wiremockUrl,
        ],
        );
    }
}
