<?php

namespace Seed\Organization;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\User\User;
use Seed\Core\Types\ArrayType;

class Organization extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var array<User> $users
     */
    #[JsonProperty('users'), ArrayType([User::class])]
    public array $users;

    /**
     * @param array{
     *   id: string,
     *   name: string,
     *   users: array<User>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->name = $values['name'];$this->users = $values['users'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
