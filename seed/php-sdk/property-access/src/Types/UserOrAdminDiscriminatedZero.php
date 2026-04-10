<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\User;
use Seed\Core\Json\JsonProperty;

class UserOrAdminDiscriminatedZero extends JsonSerializableType
{
    use User;

    /**
     * @var value-of<UserOrAdminDiscriminatedZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   id: string,
     *   email: string,
     *   password: string,
     *   profile: UserProfile,
     *   type: value-of<UserOrAdminDiscriminatedZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->email = $values['email'];
        $this->password = $values['password'];
        $this->profile = $values['profile'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
