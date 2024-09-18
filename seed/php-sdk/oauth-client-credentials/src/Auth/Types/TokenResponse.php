<?php

namespace Seed\Auth\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

/**
* An OAuth token response.
 */
class TokenResponse extends SerializableType
{
    #[JsonProperty("access_token")]
    /**
     * @var string $accessToken
     */
    public string $accessToken;

    #[JsonProperty("expires_in")]
    /**
     * @var int $expiresIn
     */
    public int $expiresIn;

    #[JsonProperty("refresh_token")]
    /**
     * @var ?string $refreshToken
     */
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
