<?php

namespace Seed\Traits;

use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;

/**
 * Common audit metadata.
 *
 * @property ?string $createdBy
 * @property ?DateTime $createdDateTime
 * @property ?string $modifiedBy
 * @property ?DateTime $modifiedDateTime
 */
trait AuditInfo
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
}
