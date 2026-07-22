<?php

namespace Seed\Auth\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Auth\Types\GetTokenAuthRequestAudience;
use Seed\Core\Json\JsonProperty;
use Seed\Auth\Types\GetTokenAuthRequestGrantType;

class GetTokenAuthRequest extends JsonSerializableType
{
    /**
     * @var ?value-of<GetTokenAuthRequestAudience> $audience
     */
    public ?string $audience;

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
     * @var string $scopes
     */
    #[JsonProperty('scopes')]
    public string $scopes;

    /**
     * @var value-of<GetTokenAuthRequestGrantType> $grantType
     */
    #[JsonProperty('grant_type')]
    public string $grantType;

    /**
     * @var string $tenant
     */
    #[JsonProperty('tenant')]
    public string $tenant;

    /**
     * @var ?string $optionalHint
     */
    #[JsonProperty('optional_hint')]
    public ?string $optionalHint;

    /**
     * @param array{
     *   clientId: string,
     *   clientSecret: string,
     *   scopes: string,
     *   grantType: value-of<GetTokenAuthRequestGrantType>,
     *   tenant: string,
     *   audience?: ?value-of<GetTokenAuthRequestAudience>,
     *   optionalHint?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->audience = $values['audience'] ?? null;
        $this->clientId = $values['clientId'];
        $this->clientSecret = $values['clientSecret'];
        $this->scopes = $values['scopes'];
        $this->grantType = $values['grantType'];
        $this->tenant = $values['tenant'];
        $this->optionalHint = $values['optionalHint'] ?? null;
    }
}
