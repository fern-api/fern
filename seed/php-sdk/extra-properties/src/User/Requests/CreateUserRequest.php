<?php

namespace Seed\User\Requests;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class CreateUserRequest extends SerializableType
{
    /**
     * @var string $type
     */
    #[JsonProperty('_type')]
    public string $type;

    /**
     * @var string $version
     */
    #[JsonProperty('_version')]
    public string $version;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @param array{
     *   type: string,
     *   version: string,
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->version = $values['version'];
        $this->name = $values['name'];
    }
}
