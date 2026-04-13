<?php

namespace Seed\Auth\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Auth\Types\RefreshTokenRequestAudience;
use Seed\Auth\Types\RefreshTokenRequestGrantType;

class RefreshTokenRequest extends JsonSerializableType
{
    /**
     * @var string $clientId
     */
    #[JsonProperty('client_id')]
    public string $clientId;

    /**
     * @var string $clientSecret
     */
    #[JsonProperty('client_secret')]
    public string $clientSecret;

    /**
     * @var string $refreshToken
     */
    #[JsonProperty('refresh_token')]
    public string $refreshToken;

    /**
     * @var value-of<RefreshTokenRequestAudience> $audience
     */
    #[JsonProperty('audience')]
    public string $audience;

    /**
     * @var value-of<RefreshTokenRequestGrantType> $grantType
     */
    #[JsonProperty('grant_type')]
    public string $grantType;

    /**
     * @var ?string $scope
     */
    #[JsonProperty('scope')]
    public ?string $scope;

    /**
     * @param array{
     *   clientId: string,
     *   clientSecret: string,
     *   refreshToken: string,
     *   audience: value-of<RefreshTokenRequestAudience>,
     *   grantType: value-of<RefreshTokenRequestGrantType>,
     *   scope?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->clientId = $values['clientId'];
        $this->clientSecret = $values['clientSecret'];
        $this->refreshToken = $values['refreshToken'];
        $this->audience = $values['audience'];
        $this->grantType = $values['grantType'];
        $this->scope = $values['scope'] ?? null;
    }
}
