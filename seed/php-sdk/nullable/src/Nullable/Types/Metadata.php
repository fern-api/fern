<?php

namespace Seed\Nullable\Types;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;

class Metadata extends JsonSerializableType
{
    /**
     * @var DateTime $createdAt
     */
    #[JsonProperty('createdAt'), Date(Date::TYPE_DATETIME)]
    public DateTime $createdAt;

    /**
     * @var DateTime $updatedAt
     */
    #[JsonProperty('updatedAt'), Date(Date::TYPE_DATETIME)]
    public DateTime $updatedAt;

    /**
     * @var ?string $avatar
     */
    #[JsonProperty('avatar')]
    public ?string $avatar;

    /**
     * @var ?bool $activated
     */
    #[JsonProperty('activated')]
    public ?bool $activated;

    /**
     * @param array{
     *   createdAt: DateTime,
     *   updatedAt: DateTime,
     *   avatar?: ?string,
     *   activated?: ?bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->createdAt = $values['createdAt'];
        $this->updatedAt = $values['updatedAt'];
        $this->avatar = $values['avatar'] ?? null;
        $this->activated = $values['activated'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
