<?php

namespace Seed\Auth\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GetTokenRequest extends JsonSerializableType
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
     * @var 'https://api.example.com' $audience
     */
    #[JsonProperty('audience')]
    public string $audience;

    /**
     * @var 'client_credentials' $grantType
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
     *   audience: 'https://api.example.com',
     *   grantType: 'client_credentials',
     *   scope?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->xApiKey = $values['xApiKey'];$this->clientId = $values['clientId'];$this->clientSecret = $values['clientSecret'];$this->audience = $values['audience'];$this->grantType = $values['grantType'];$this->scope = $values['scope'] ?? null;
    }
}
