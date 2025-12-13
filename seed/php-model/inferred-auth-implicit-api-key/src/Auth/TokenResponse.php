<?php

namespace Seed\Auth;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * An auth token response.
 */
class TokenResponse extends JsonSerializableType
{
    /**
     * @var string $accessToken
     */
    #[JsonProperty('access_token')]
    public string $accessToken;

    /**
     * @var string $tokenType
     */
    #[JsonProperty('token_type')]
    public string $tokenType;

    /**
     * @var int $expiresIn
     */
    #[JsonProperty('expires_in')]
    public int $expiresIn;

    /**
     * @var ?string $scope
     */
    #[JsonProperty('scope')]
    public ?string $scope;

    /**
     * @param array{
     *   accessToken: string,
     *   tokenType: string,
     *   expiresIn: int,
     *   scope?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->accessToken = $values['accessToken'];
        $this->tokenType = $values['tokenType'];
        $this->expiresIn = $values['expiresIn'];
        $this->scope = $values['scope'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
