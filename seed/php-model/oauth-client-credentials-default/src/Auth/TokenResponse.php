<?php

namespace Seed\Auth;

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
    #[JsonProperty('access_token')]
    public string $accessToken;

    /**
     * @var int $expiresIn
     */
    #[JsonProperty('expires_in')]
    public int $expiresIn;

    /**
     * @param array{
     *   accessToken: string,
     *   expiresIn: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->accessToken = $values['accessToken'];
        $this->expiresIn = $values['expiresIn'];
    }
}
