<?php

namespace Seed\Auth\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GetTokenRequest extends JsonSerializableType
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
     * @var 'client_credentials' $grantType
     */
    #[JsonProperty('grant_type')]
    public string $grantType;

    /**
     * @param array{
     *   clientId: string,
     *   clientSecret: string,
     *   grantType: 'client_credentials',
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->clientId = $values['clientId'];$this->clientSecret = $values['clientSecret'];$this->grantType = $values['grantType'];
    }
}
