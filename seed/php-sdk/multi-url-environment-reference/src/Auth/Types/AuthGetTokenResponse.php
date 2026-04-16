<?php

namespace Seed\Auth\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class AuthGetTokenResponse extends JsonSerializableType
{
    /**
     * @var string $accessToken
     */
    #[JsonProperty('access_token')]
    public string $accessToken;

    /**
     * @param array{
     *   accessToken: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->accessToken = $values['accessToken'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
