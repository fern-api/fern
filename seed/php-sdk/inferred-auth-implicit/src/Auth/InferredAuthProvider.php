<?php

namespace Seed\Auth;

use Seed\SeedClient;
use DateTime;

class InferredAuthProvider
{
    /**
     * @var SeedClient $client @var SeedClient $client
     */
    private SeedClient $client;

    /**
     * @var array<string, mixed> $authTokenParameters @var array<string, mixed> $authTokenParameters
     */
    private array $authTokenParameters;

    /**
     * @var ?DateTime $expiresAt @var ?\DateTime $expiresAt
     */
    private ?DateTime $expiresAt;

    /**
     * @var ?array<string, string> $cachedAuthHeaders @var ?array<string, string> $cachedAuthHeaders
     */
    private ?array $cachedAuthHeaders;

    /**
     * @param SeedClient $client
     * @param array<string, mixed> $authTokenParameters @var array<string, mixed> $authTokenParameters
     */
    public function __construct(
        SeedClient $client,
        array $authTokenParameters,
    ) {
        $this->client = $client;
        $this->authTokenParameters = $authTokenParameters;
    }

    /**
     * Get authentication headers.
     *
     * @return array<string, string>
     *
     * @return array<string, string>
     */
    public function getAuthHeaders(): array
    {
        try {
            return $this->getCachedAuthHeaders();
        } catch (\Exception $e) {
            $this->cachedAuthHeaders = null;
            $this->expiresAt = null;
            throw $e;
        }
    }

    /**
     * Get cached authentication headers.
     *
     * @return array<string, string>
     *
     * @return array<string, string>
     */
    private function getCachedAuthHeaders(): array
    {
        if ($this->expiresAt !== null && $this->expiresAt <= new \DateTime()) {
            $this->cachedAuthHeaders = null;
        }

        if ($this->cachedAuthHeaders === null) {
            $this->cachedAuthHeaders = $this->getAuthHeadersFromTokenEndpoint();
        }

        return $this->cachedAuthHeaders;
    }

    /**
     * Get authentication headers from token endpoint.
     *
     * @return array<string, string>
     *
     * @return array<string, string>
     */
    private function getAuthHeadersFromTokenEndpoint(): array
    {
        /** @phpstan-ignore-next-line */
        $request = new \Seed\Auth\Requests\GetTokenRequest($this->authTokenParameters);

        $response = $this->client->auth->getTokenWithClientCredentials($request);

        $this->expiresAt = $this->getExpiresAt($response->expiresIn);

        return [
            'Authorization' => 'Bearer ' . $response->accessToken,
        ];
    }

    /**
     * Calculate expiry time with buffer.
     *
     * @param int $expiresInSeconds
     * @return \DateTime
     *
     * @param int $expiresInSeconds
     * @return DateTime
     */
    private function getExpiresAt(int $expiresInSeconds): DateTime
    {
        $expiryTime = time() + $expiresInSeconds - 2 * 60;
        return (new \DateTime())->setTimestamp($expiryTime);
    }
}
