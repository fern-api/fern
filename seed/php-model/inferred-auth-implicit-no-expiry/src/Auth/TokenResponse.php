<?php

namespace Seed\Auth;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * An OAuth token response.
 */
class TokenResponse extends JsonSerializableType
{
    /**
     * @var string $accessToken
     */
    #[JsonProperty('access_token')]
    public string $accessToken;

    /**
     * @var ?string $refreshToken
     */
    #[JsonProperty('refresh_token')]
    public ?string $refreshToken;

    /**
     * @param array{
     *   accessToken: string,
     *   refreshToken?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->accessToken = $values['accessToken'];$this->refreshToken = $values['refreshToken'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
