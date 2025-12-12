<?php

namespace Seed\Core;

use Seed\Auth\AuthClient;
use DateTime;
use Seed\Auth\Requests\GetTokenRequest;

/**
 * The InferredAuthProvider retrieves an access token from the configured token endpoint.
 * The access token is then used as the bearer token in every authenticated request.
 */
class InferredAuthProvider
{
    /**
     * @var int $BUFFER_IN_MINUTES
     */
    private int $BUFFER_IN_MINUTES = 2;

    /**
     * @var AuthClient $authClient
     */
    private AuthClient $authClient;

    /**
     * @var array<mixed> $options
     */
    private array $options;

    /**
     * @var ?string $accessToken
     */
    private ?string $accessToken;

    /**
     * @var ?DateTime $expiresAt
     */
    private ?DateTime $expiresAt;

    /**
     * @param AuthClient $authClient The client used to retrieve the access token.
     * @param array<mixed> $options The options containing credentials for the token endpoint.
     */
    public function __construct(
        AuthClient $authClient,
        array $options,
    ) {
        $this->authClient = $authClient;
        $this->options = $options;
        $this->accessToken = null;
        $this->expiresAt = null;
    }

    /**
     * Returns a cached access token, refreshing if necessary.
     *
     * @return string
     */
    public function getToken(): string
    {
        if ($this->accessToken !== null && ($this->expiresAt === null || $this->expiresAt > new DateTime())) {
            return $this->accessToken;
        }
        return $this->refresh();
    }

    /**
     * Returns the authentication headers to be included in requests.
     *
     * @return array<string, string>
     */
    public function getAuthHeaders(): array
    {
        $token = $this->getToken();
        return [
            'Authorization' => "Bearer " . $token,
        ];
    }

    /**
     * Refreshes the access token by calling the token endpoint.
     *
     * @return string
     */
    private function refresh(): string
    {
        /** @var array{xApiKey: string, clientId: string, clientSecret: string, audience: 'https://api.example.com', grantType: 'client_credentials', scope?: string|null} $values */
        $values = [
            'xApiKey' => $this->options['xApiKey'] ?? '',
            'clientId' => $this->options['clientId'] ?? '',
            'clientSecret' => $this->options['clientSecret'] ?? '',
            'audience' => 'https://api.example.com',
            'grantType' => 'client_credentials',
            'scope' => $this->options['scope'] ?? null,
        ];

        $request = new GetTokenRequest($values);

        $tokenResponse = $this->authClient->getTokenWithClientCredentials($request);

        $this->accessToken = $tokenResponse->accessToken;
        $this->expiresAt = $this->getExpiresAt($tokenResponse->expiresIn, $this->BUFFER_IN_MINUTES);

        return $this->accessToken;
    }

    /**
     * Calculates the expiration time with a buffer.
     *
     * @param int $expiresInSeconds The number of seconds until the token expires.
     * @param int $bufferInMinutes The buffer time in minutes to subtract from the expiration.
     * @return DateTime
     */
    private function getExpiresAt(int $expiresInSeconds, int $bufferInMinutes): DateTime
    {
        $now = new DateTime();
        $expiresInSecondsWithBuffer = $expiresInSeconds - ($bufferInMinutes * 60);
        $now->modify("+{$expiresInSecondsWithBuffer} seconds");
        return $now;
    }
}
