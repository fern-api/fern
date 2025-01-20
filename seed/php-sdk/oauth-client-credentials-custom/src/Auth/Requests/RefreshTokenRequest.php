<?php

namespace Seed\Auth\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

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
     * @var string $audience
     */
    #[JsonProperty('audience')]
    public string $audience;

    /**
     * @var string $grantType
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
     *   audience: string,
     *   grantType: string,
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
