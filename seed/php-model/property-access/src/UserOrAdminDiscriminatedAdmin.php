<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UserOrAdminDiscriminatedAdmin extends JsonSerializableType
{
    /**
     * @var value-of<UserOrAdminDiscriminatedAdminType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var ?Admin $admin
     */
    #[JsonProperty('admin')]
    public ?Admin $admin;

    /**
     * @param array{
     *   type: value-of<UserOrAdminDiscriminatedAdminType>,
     *   admin?: ?Admin,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->admin = $values['admin'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
