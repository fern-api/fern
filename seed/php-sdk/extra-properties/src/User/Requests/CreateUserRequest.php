<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CreateUserRequest extends JsonSerializableType
{
    /**
     * @var 'CreateUserRequest' $type
     */
    #[JsonProperty('_type')]
    public string $type;

    /**
     * @var 'v1' $version
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
     *   type: 'CreateUserRequest',
     *   version: 'v1',
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->type = $values['type'];$this->version = $values['version'];$this->name = $values['name'];
    }
}
