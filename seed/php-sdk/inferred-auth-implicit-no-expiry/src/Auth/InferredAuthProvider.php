<?php

namespace Seed\Auth;

use Seed\SeedClient;

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
        return $this->getAuthHeadersFromTokenEndpoint();
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

        return [
            'Authorization' => 'Bearer ' . $response->accessToken,
        ];
    }
}
