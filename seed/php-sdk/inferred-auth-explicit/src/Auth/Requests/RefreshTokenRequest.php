<?php

namespace Seed\Auth\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class RefreshTokenRequest extends JsonSerializableType
{
    /**
     * @var string $xApiKey
     */
    public string $xApiKey;

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
     * @var 'https://api.example.com' $audience
     */
    #[JsonProperty('audience')]
    public string $audience;

    /**
     * @var 'refresh_token' $grantType
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
     *   xApiKey: string,
     *   clientId: string,
     *   clientSecret: string,
     *   refreshToken: string,
     *   audience: 'https://api.example.com',
     *   grantType: 'refresh_token',
     *   scope?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->xApiKey = $values['xApiKey'];$this->clientId = $values['clientId'];$this->clientSecret = $values['clientSecret'];$this->refreshToken = $values['refreshToken'];$this->audience = $values['audience'];$this->grantType = $values['grantType'];$this->scope = $values['scope'] ?? null;
    }
}
