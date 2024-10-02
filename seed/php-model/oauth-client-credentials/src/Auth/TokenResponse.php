<?php

namespace Seed\Auth;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

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
     * @var ?string $refreshToken
     */
    #[JsonProperty('refresh_token')]
    public ?string $refreshToken;

    /**
     * @param array{
     *   accessToken: string,
     *   expiresIn: int,
     *   refreshToken?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->accessToken = $values['accessToken'];
        $this->expiresIn = $values['expiresIn'];
        $this->refreshToken = $values['refreshToken'] ?? null;
    }
}
