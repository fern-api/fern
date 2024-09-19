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

    /**
     * @param string $clientId
     * @param string $clientSecret
     * @param string $audience
     * @param string $grantType
     * @param ?string $scope
     */
    public function __construct(
        string $clientId,
        string $clientSecret,
        string $audience,
        string $grantType,
        ?string $scope = null,
    ) {
        $this->clientId = $clientId;
        $this->clientSecret = $clientSecret;
        $this->audience = $audience;
        $this->grantType = $grantType;
        $this->scope = $scope;
    }
}
