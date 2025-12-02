<?php

namespace Seed\Nullable;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

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
     * @var Status $status
     */
    #[JsonProperty('status')]
    public Status $status;

    /**
     * @var ?array<string, ?string> $values
     */
    #[JsonProperty('values'), ArrayType(['string' => new Union('string', 'null')])]
    public ?array $values;

    /**
     * @param array{
     *   createdAt: DateTime,
     *   updatedAt: DateTime,
     *   status: Status,
     *   avatar?: ?string,
     *   activated?: ?bool,
     *   values?: ?array<string, ?string>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->createdAt = $values['createdAt'];$this->updatedAt = $values['updatedAt'];$this->avatar = $values['avatar'] ?? null;$this->activated = $values['activated'] ?? null;$this->status = $values['status'];$this->values = $values['values'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
