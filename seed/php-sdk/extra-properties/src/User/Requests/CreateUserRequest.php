<?php

namespace Seed\User\Requests;

use Seed\Core\JsonProperty;

class CreateUserRequest
{
    /**
     * @var string $type
     */
    #[JsonProperty("_type")]
    public string $type;

    /**
     * @var string $version
     */
    #[JsonProperty("_version")]
    public string $version;

    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

}
