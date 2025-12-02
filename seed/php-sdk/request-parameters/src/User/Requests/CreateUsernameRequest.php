<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CreateUsernameRequest extends JsonSerializableType
{
    /**
     * @var array<string> $tags
     */
    public array $tags;

    /**
     * @var string $username
     */
    #[JsonProperty('username')]
    public string $username;

    /**
     * @var string $password
     */
    #[JsonProperty('password')]
    public string $password;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @param array{
     *   tags: array<string>,
     *   username: string,
     *   password: string,
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->tags = $values['tags'];$this->username = $values['username'];$this->password = $values['password'];$this->name = $values['name'];
    }
}
