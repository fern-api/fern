<?php

namespace Seed\Auth\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Auth\Types\AuthGetTokenRequestAudience;
use Seed\Auth\Types\AuthGetTokenRequestGrantType;

class AuthGetTokenRequest extends JsonSerializableType
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
     * @var value-of<AuthGetTokenRequestAudience> $audience
     */
    #[JsonProperty('audience')]
    public string $audience;

    /**
     * @var value-of<AuthGetTokenRequestGrantType> $grantType
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
     *   audience: value-of<AuthGetTokenRequestAudience>,
     *   grantType: value-of<AuthGetTokenRequestGrantType>,
     *   scope?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->clientId = $values['clientId'];
        $this->clientSecret = $values['clientSecret'];
        $this->audience = $values['audience'];
        $this->grantType = $values['grantType'];
        $this->scope = $values['scope'] ?? null;
    }
}
