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
     * @var string $audience
     */
    #[JsonProperty("audience")]
    public string $audience;

    /**
     * @var string $grantType
     */
    #[JsonProperty("grant_type")]
    public string $grantType;

    /**
     * @var ?string $scope
     */
    #[JsonProperty("scope")]
    public ?string $scope;

}
