<?php

namespace Seed\Auth\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

/**
* An OAuth token response.
 */
class TokenResponse extends SerializableType
{
    /**
     * @var string $accessToken
     */
    #[JsonProperty("access_token")]
    public string $accessToken;

    /**
     * @var int $expiresIn
     */
    #[JsonProperty("expires_in")]
    public int $expiresIn;

    /**
     * @var ?string $refreshToken
     */
    #[JsonProperty("refresh_token")]
    public ?string $refreshToken;

    /**
     * @param string $accessToken
     * @param int $expiresIn
     * @param ?string $refreshToken
     */
    public function __construct(
        string $accessToken,
        int $expiresIn,
        ?string $refreshToken = null,
    ) {
        $this->accessToken = $accessToken;
        $this->expiresIn = $expiresIn;
        $this->refreshToken = $refreshToken;
    }
}
