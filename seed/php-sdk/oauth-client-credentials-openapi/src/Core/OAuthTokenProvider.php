<?php

namespace Seed\Core;

use Seed\Identity\IdentityClient;
use DateTime;
use Seed\Identity\Requests\GetTokenIdentityRequest;
use Seed\Exceptions\SeedException;

/**
 * The OAuthTokenProvider retrieves an OAuth access token, refreshing it as needed.
 * The access token is then used as the bearer token in every authenticated request.
 */
class OAuthTokenProvider
{
    /**
     * @var int $BUFFER_IN_MINUTES
     */
    private int $BUFFER_IN_MINUTES = 2;

    /**
     * @var string $clientId
     */
    private string $clientId;

    /**
     * @var string $clientSecret
     */
    private string $clientSecret;

    /**
     * @var IdentityClient $authClient
     */
    private IdentityClient $authClient;

    /**
     * @var ?string $accessToken
     */
    private ?string $accessToken;

    /**
     * @var ?DateTime $expiresAt
     */
    private ?DateTime $expiresAt;

    /**
     * @param string $clientId The client ID for OAuth authentication.
     * @param string $clientSecret The client secret for OAuth authentication.
     * @param IdentityClient $authClient The client used to retrieve the OAuth token.
     */
    public function __construct(
        string $clientId,
        string $clientSecret,
        IdentityClient $authClient,
    ) {
        $this->clientId = $clientId;
        $this->clientSecret = $clientSecret;
        $this->authClient = $authClient;
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
     * Refreshes the access token by calling the token endpoint.
     *
     * @return string
     */
    private function refresh(): string
    {
        $request = new GetTokenIdentityRequest([
            'username' => $this->clientId,
            'password' => $this->clientSecret,
        ]);

        $tokenResponse = $this->authClient->getToken($request);

        if ($tokenResponse === null) {
            throw new SeedException(message: "Expected a token response, but received an empty response.");
        }

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
