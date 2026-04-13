<?php

namespace Seed\Auth\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Auth\Types\AuthRefreshTokenRequestAudience;
use Seed\Auth\Types\AuthRefreshTokenRequestGrantType;

class AuthRefreshTokenRequest extends JsonSerializableType
{
    /**
     * @var string $apiKey
     */
    public string $apiKey;

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
     * @var value-of<AuthRefreshTokenRequestAudience> $audience
     */
    #[JsonProperty('audience')]
    public string $audience;

    /**
     * @var value-of<AuthRefreshTokenRequestGrantType> $grantType
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
     *   apiKey: string,
     *   clientId: string,
     *   clientSecret: string,
     *   refreshToken: string,
     *   audience: value-of<AuthRefreshTokenRequestAudience>,
     *   grantType: value-of<AuthRefreshTokenRequestGrantType>,
     *   scope?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->apiKey = $values['apiKey'];
        $this->clientId = $values['clientId'];
        $this->clientSecret = $values['clientSecret'];
        $this->refreshToken = $values['refreshToken'];
        $this->audience = $values['audience'];
        $this->grantType = $values['grantType'];
        $this->scope = $values['scope'] ?? null;
    }
}
