<?php

namespace Seed\Auth\Requests;

use Seed\Core\JsonProperty;

class GetTokenRequest
{
    /**
     * @var string $clientId
     */
    #[JsonProperty("client_id")]
    public string $clientId;

    /**
     * @var string $clientSecret
     */
    #[JsonProperty("client_secret")]
    public string $clientSecret;

    /**
     * @var string $grantType
     */
    #[JsonProperty("grant_type")]
    public string $grantType;

}
