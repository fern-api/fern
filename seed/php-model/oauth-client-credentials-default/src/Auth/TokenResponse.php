<?php

namespace Seed\Auth;

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

    /**
     * @param string $accessToken
     * @param int $expiresIn
     */
    public function __construct(
        string $accessToken,
        int $expiresIn,
    ) {
        $this->accessToken = $accessToken;
        $this->expiresIn = $expiresIn;
    }
}
