<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;

/**
 * Common audit metadata.
 */
class AuditInfo extends JsonSerializableType
{
    /**
     * @var ?string $createdBy The user who created this resource.
     */
    #[JsonProperty('createdBy')]
    public ?string $createdBy;

    /**
     * @var ?DateTime $createdDateTime When this resource was created.
     */
    #[JsonProperty('createdDateTime'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $createdDateTime;

    /**
     * @var ?string $modifiedBy The user who last modified this resource.
     */
    #[JsonProperty('modifiedBy')]
    public ?string $modifiedBy;

    /**
     * @var ?DateTime $modifiedDateTime When this resource was last modified.
     */
    #[JsonProperty('modifiedDateTime'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $modifiedDateTime;

    /**
     * @param array{
     *   createdBy?: ?string,
     *   createdDateTime?: ?DateTime,
     *   modifiedBy?: ?string,
     *   modifiedDateTime?: ?DateTime,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->createdBy = $values['createdBy'] ?? null;
        $this->createdDateTime = $values['createdDateTime'] ?? null;
        $this->modifiedBy = $values['modifiedBy'] ?? null;
        $this->modifiedDateTime = $values['modifiedDateTime'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
