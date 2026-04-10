<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;
use Seed\Core\Types\ArrayType;

/**
 * Test object with nullable enums, unions, and arrays
 */
class ComplexProfile extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var value-of<UserRole> $nullableRole
     */
    #[JsonProperty('nullableRole')]
    public string $nullableRole;

    /**
     * @var ?value-of<UserRole> $optionalRole
     */
    #[JsonProperty('optionalRole')]
    public ?string $optionalRole;

    /**
     * @var ?value-of<UserRole> $optionalNullableRole
     */
    #[JsonProperty('optionalNullableRole')]
    public ?string $optionalNullableRole;

    /**
     * @var value-of<UserStatus> $nullableStatus
     */
    #[JsonProperty('nullableStatus')]
    public string $nullableStatus;

    /**
     * @var ?value-of<UserStatus> $optionalStatus
     */
    #[JsonProperty('optionalStatus')]
    public ?string $optionalStatus;

    /**
     * @var ?value-of<UserStatus> $optionalNullableStatus
     */
    #[JsonProperty('optionalNullableStatus')]
    public ?string $optionalNullableStatus;

    /**
     * @var (
     *    NotificationMethodZero
     *   |NotificationMethodOne
     *   |NotificationMethodTwo
     * ) $nullableNotification
     */
    #[JsonProperty('nullableNotification'), Union(NotificationMethodZero::class, NotificationMethodOne::class, NotificationMethodTwo::class)]
    public NotificationMethodZero|NotificationMethodOne|NotificationMethodTwo $nullableNotification;

    /**
     * @var (
     *    NotificationMethodZero
     *   |NotificationMethodOne
     *   |NotificationMethodTwo
     * )|null $optionalNotification
     */
    #[JsonProperty('optionalNotification'), Union(NotificationMethodZero::class, NotificationMethodOne::class, NotificationMethodTwo::class, 'null')]
    public NotificationMethodZero|NotificationMethodOne|NotificationMethodTwo|null $optionalNotification;

    /**
     * @var (
     *    NotificationMethodZero
     *   |NotificationMethodOne
     *   |NotificationMethodTwo
     * )|null $optionalNullableNotification
     */
    #[JsonProperty('optionalNullableNotification'), Union(NotificationMethodZero::class, NotificationMethodOne::class, NotificationMethodTwo::class, 'null')]
    public NotificationMethodZero|NotificationMethodOne|NotificationMethodTwo|null $optionalNullableNotification;

    /**
     * @var (
     *    SearchResultZero
     *   |SearchResultOne
     *   |SearchResultTwo
     * ) $nullableSearchResult
     */
    #[JsonProperty('nullableSearchResult'), Union(SearchResultZero::class, SearchResultOne::class, SearchResultTwo::class)]
    public SearchResultZero|SearchResultOne|SearchResultTwo $nullableSearchResult;

    /**
     * @var (
     *    SearchResultZero
     *   |SearchResultOne
     *   |SearchResultTwo
     * )|null $optionalSearchResult
     */
    #[JsonProperty('optionalSearchResult'), Union(SearchResultZero::class, SearchResultOne::class, SearchResultTwo::class, 'null')]
    public SearchResultZero|SearchResultOne|SearchResultTwo|null $optionalSearchResult;

    /**
     * @var ?array<string> $nullableArray
     */
    #[JsonProperty('nullableArray'), ArrayType(['string'])]
    public ?array $nullableArray;

    /**
     * @var ?array<string> $optionalArray
     */
    #[JsonProperty('optionalArray'), ArrayType(['string'])]
    public ?array $optionalArray;

    /**
     * @var ?array<string> $optionalNullableArray
     */
    #[JsonProperty('optionalNullableArray'), ArrayType(['string'])]
    public ?array $optionalNullableArray;

    /**
     * @var ?array<?string> $nullableListOfNullables
     */
    #[JsonProperty('nullableListOfNullables'), ArrayType([new Union('string', 'null')])]
    public ?array $nullableListOfNullables;

    /**
     * @var ?array<string, ?Address> $nullableMapOfNullables
     */
    #[JsonProperty('nullableMapOfNullables'), ArrayType(['string' => new Union(Address::class, 'null')])]
    public ?array $nullableMapOfNullables;

    /**
     * @var ?array<(
     *    NotificationMethodZero
     *   |NotificationMethodOne
     *   |NotificationMethodTwo
     * )> $nullableListOfUnions
     */
    #[JsonProperty('nullableListOfUnions'), ArrayType([new Union(NotificationMethodZero::class, NotificationMethodOne::class, NotificationMethodTwo::class)])]
    public ?array $nullableListOfUnions;

    /**
     * @var ?array<string, ?value-of<UserRole>> $optionalMapOfEnums
     */
    #[JsonProperty('optionalMapOfEnums'), ArrayType(['string' => new Union('string', 'null')])]
    public ?array $optionalMapOfEnums;

    /**
     * @param array{
     *   id: string,
     *   nullableRole: value-of<UserRole>,
     *   nullableStatus: value-of<UserStatus>,
     *   nullableNotification: (
     *    NotificationMethodZero
     *   |NotificationMethodOne
     *   |NotificationMethodTwo
     * ),
     *   nullableSearchResult: (
     *    SearchResultZero
     *   |SearchResultOne
     *   |SearchResultTwo
     * ),
     *   optionalRole?: ?value-of<UserRole>,
     *   optionalNullableRole?: ?value-of<UserRole>,
     *   optionalStatus?: ?value-of<UserStatus>,
     *   optionalNullableStatus?: ?value-of<UserStatus>,
     *   optionalNotification?: (
     *    NotificationMethodZero
     *   |NotificationMethodOne
     *   |NotificationMethodTwo
     * )|null,
     *   optionalNullableNotification?: (
     *    NotificationMethodZero
     *   |NotificationMethodOne
     *   |NotificationMethodTwo
     * )|null,
     *   optionalSearchResult?: (
     *    SearchResultZero
     *   |SearchResultOne
     *   |SearchResultTwo
     * )|null,
     *   nullableArray?: ?array<string>,
     *   optionalArray?: ?array<string>,
     *   optionalNullableArray?: ?array<string>,
     *   nullableListOfNullables?: ?array<?string>,
     *   nullableMapOfNullables?: ?array<string, ?Address>,
     *   nullableListOfUnions?: ?array<(
     *    NotificationMethodZero
     *   |NotificationMethodOne
     *   |NotificationMethodTwo
     * )>,
     *   optionalMapOfEnums?: ?array<string, ?value-of<UserRole>>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->nullableRole = $values['nullableRole'];
        $this->optionalRole = $values['optionalRole'] ?? null;
        $this->optionalNullableRole = $values['optionalNullableRole'] ?? null;
        $this->nullableStatus = $values['nullableStatus'];
        $this->optionalStatus = $values['optionalStatus'] ?? null;
        $this->optionalNullableStatus = $values['optionalNullableStatus'] ?? null;
        $this->nullableNotification = $values['nullableNotification'];
        $this->optionalNotification = $values['optionalNotification'] ?? null;
        $this->optionalNullableNotification = $values['optionalNullableNotification'] ?? null;
        $this->nullableSearchResult = $values['nullableSearchResult'];
        $this->optionalSearchResult = $values['optionalSearchResult'] ?? null;
        $this->nullableArray = $values['nullableArray'] ?? null;
        $this->optionalArray = $values['optionalArray'] ?? null;
        $this->optionalNullableArray = $values['optionalNullableArray'] ?? null;
        $this->nullableListOfNullables = $values['nullableListOfNullables'] ?? null;
        $this->nullableMapOfNullables = $values['nullableMapOfNullables'] ?? null;
        $this->nullableListOfUnions = $values['nullableListOfUnions'] ?? null;
        $this->optionalMapOfEnums = $values['optionalMapOfEnums'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
