<?php

namespace Seed\Nullableoptional\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\UserRole;
use Seed\Core\Json\JsonProperty;
use Seed\Types\UserStatus;
use Seed\Types\NotificationMethodZero;
use Seed\Types\NotificationMethodOne;
use Seed\Types\NotificationMethodTwo;
use Seed\Core\Types\Union;
use Seed\Types\SearchResultZero;
use Seed\Types\SearchResultOne;
use Seed\Types\SearchResultTwo;
use Seed\Core\Types\ArrayType;

class NullableOptionalUpdateComplexProfileRequest extends JsonSerializableType
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
     * @var (
     *    NotificationMethodZero
     *   |NotificationMethodOne
     *   |NotificationMethodTwo
     * )|null $nullableNotification
     */
    #[JsonProperty('nullableNotification'), Union(NotificationMethodZero::class, NotificationMethodOne::class, NotificationMethodTwo::class, 'null')]
    public NotificationMethodZero|NotificationMethodOne|NotificationMethodTwo|null $nullableNotification;

    /**
     * @var (
     *    SearchResultZero
     *   |SearchResultOne
     *   |SearchResultTwo
     * )|null $nullableSearchResult
     */
    #[JsonProperty('nullableSearchResult'), Union(SearchResultZero::class, SearchResultOne::class, SearchResultTwo::class, 'null')]
    public SearchResultZero|SearchResultOne|SearchResultTwo|null $nullableSearchResult;

    /**
     * @var ?array<string> $nullableArray
     */
    #[JsonProperty('nullableArray'), ArrayType(['string'])]
    public ?array $nullableArray;

    /**
     * @param array{
     *   nullableRole?: ?value-of<UserRole>,
     *   nullableStatus?: ?value-of<UserStatus>,
     *   nullableNotification?: (
     *    NotificationMethodZero
     *   |NotificationMethodOne
     *   |NotificationMethodTwo
     * )|null,
     *   nullableSearchResult?: (
     *    SearchResultZero
     *   |SearchResultOne
     *   |SearchResultTwo
     * )|null,
     *   nullableArray?: ?array<string>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->nullableRole = $values['nullableRole'] ?? null;
        $this->nullableStatus = $values['nullableStatus'] ?? null;
        $this->nullableNotification = $values['nullableNotification'] ?? null;
        $this->nullableSearchResult = $values['nullableSearchResult'] ?? null;
        $this->nullableArray = $values['nullableArray'] ?? null;
    }
}
