<?php

namespace Seed\NullableOptional\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\NullableOptional\Types\UserRole;
use Seed\Core\Json\JsonProperty;
use Seed\NullableOptional\Types\UserStatus;
use Seed\NullableOptional\Types\NotificationMethod;
use Seed\NullableOptional\Types\SearchResult;
use Seed\Core\Types\ArrayType;

class UpdateComplexProfileRequest extends JsonSerializableType
{
    /**
     * @var ?value-of<UserRole> $nullableRole
     */
    #[JsonProperty('nullableRole')]
    public ?string $nullableRole;

    /**
     * @var ?value-of<UserStatus> $nullableStatus
     */
    #[JsonProperty('nullableStatus')]
    public ?string $nullableStatus;

    /**
     * @var ?NotificationMethod $nullableNotification
     */
    #[JsonProperty('nullableNotification')]
    public ?NotificationMethod $nullableNotification;

    /**
     * @var ?SearchResult $nullableSearchResult
     */
    #[JsonProperty('nullableSearchResult')]
    public ?SearchResult $nullableSearchResult;

    /**
     * @var ?array<string> $nullableArray
     */
    #[JsonProperty('nullableArray'), ArrayType(['string'])]
    public ?array $nullableArray;

    /**
     * @param array{
     *   nullableRole?: ?value-of<UserRole>,
     *   nullableStatus?: ?value-of<UserStatus>,
     *   nullableNotification?: ?NotificationMethod,
     *   nullableSearchResult?: ?SearchResult,
     *   nullableArray?: ?array<string>,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->nullableRole = $values['nullableRole'] ?? null;$this->nullableStatus = $values['nullableStatus'] ?? null;$this->nullableNotification = $values['nullableNotification'] ?? null;$this->nullableSearchResult = $values['nullableSearchResult'] ?? null;$this->nullableArray = $values['nullableArray'] ?? null;
    }
}
