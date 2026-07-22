<?php

namespace Seed\Auth\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Auth\Types\RefreshTokenAuthRequestGrantType;

class RefreshTokenAuthRequest extends JsonSerializableType
{
    /**
     * @var string $refreshToken
     */
    #[JsonProperty('refresh_token')]
    public string $refreshToken;

    /**
     * @var value-of<RefreshTokenAuthRequestGrantType> $grantType
     */
    #[JsonProperty('grant_type')]
    public string $grantType;

    /**
     * @param array{
     *   refreshToken: string,
     *   grantType: value-of<RefreshTokenAuthRequestGrantType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->refreshToken = $values['refreshToken'];
        $this->grantType = $values['grantType'];
    }
}
