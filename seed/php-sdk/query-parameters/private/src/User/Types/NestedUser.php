<?php

namespace Seed\User\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NestedUser extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    private string $name;

    /**
     * @var User $user
     */
    #[JsonProperty('user')]
    private User $user;

    /**
     * @param array{
     *   name: string,
     *   user: User,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->user = $values['user'];
    }

    /**
     * @return string
     */
    public function getName(): string {
        return $this->name;}

    /**
     * @param string $value
     */
    public function setName(string $value): self {
        $this->name = $value;return $this;}

    /**
     * @return User
     */
    public function getUser(): User {
        return $this->user;}

    /**
     * @param User $value
     */
    public function setUser(User $value): self {
        $this->user = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
