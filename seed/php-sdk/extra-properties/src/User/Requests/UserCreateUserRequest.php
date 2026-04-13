<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\User\Types\UserCreateUserRequestType;
use Seed\Core\Json\JsonProperty;
use Seed\User\Types\UserCreateUserRequestVersion;

class UserCreateUserRequest extends JsonSerializableType
{
    /**
     * @var value-of<UserCreateUserRequestType> $type
     */
    #[JsonProperty('_type')]
    public string $type;

    /**
     * @var value-of<UserCreateUserRequestVersion> $version
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
     *   type: value-of<UserCreateUserRequestType>,
     *   version: value-of<UserCreateUserRequestVersion>,
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
