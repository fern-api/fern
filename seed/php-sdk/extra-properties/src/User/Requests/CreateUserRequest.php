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

    /**
     * @param string $type
     * @param string $version
     * @param string $name
     */
    public function __construct(
        string $type,
        string $version,
        string $name,
    ) {
        $this->type = $type;
        $this->version = $version;
        $this->name = $name;
    }
}
