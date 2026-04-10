<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;
use Seed\Core\Types\ArrayType;

/**
 * Request body for testing deserialization of null values
 */
class DeserializationTestRequest extends JsonSerializableType
{
    /**
     * @var string $requiredString
     */
    #[JsonProperty('requiredString')]
    public string $requiredString;

    /**
     * @var ?string $nullableString
     */
    #[JsonProperty('nullableString')]
    public ?string $nullableString;

    /**
     * @var ?string $optionalString
     */
    #[JsonProperty('optionalString')]
    public ?string $optionalString;

    /**
     * @var ?string $optionalNullableString
     */
    #[JsonProperty('optionalNullableString')]
    public ?string $optionalNullableString;

    /**
     * @var value-of<UserRole> $nullableEnum
     */
    #[JsonProperty('nullableEnum')]
    public string $nullableEnum;

    /**
     * @var ?value-of<UserStatus> $optionalEnum
     */
    #[JsonProperty('optionalEnum')]
    public ?string $optionalEnum;

    /**
     * @var (
     *    NotificationMethodZero
     *   |NotificationMethodOne
     *   |NotificationMethodTwo
     * ) $nullableUnion
     */
    #[JsonProperty('nullableUnion'), Union(NotificationMethodZero::class, NotificationMethodOne::class, NotificationMethodTwo::class)]
    public NotificationMethodZero|NotificationMethodOne|NotificationMethodTwo $nullableUnion;

    /**
     * @var (
     *    SearchResultZero
     *   |SearchResultOne
     *   |SearchResultTwo
     * )|null $optionalUnion
     */
    #[JsonProperty('optionalUnion'), Union(SearchResultZero::class, SearchResultOne::class, SearchResultTwo::class, 'null')]
    public SearchResultZero|SearchResultOne|SearchResultTwo|null $optionalUnion;

    /**
     * @var ?array<string> $nullableList
     */
    #[JsonProperty('nullableList'), ArrayType(['string'])]
    public ?array $nullableList;

    /**
     * @var ?array<string, ?int> $nullableMap
     */
    #[JsonProperty('nullableMap'), ArrayType(['string' => new Union('integer', 'null')])]
    public ?array $nullableMap;

    /**
     * @var Address $nullableObject
     */
    #[JsonProperty('nullableObject')]
    public Address $nullableObject;

    /**
     * @var ?Organization $optionalObject
     */
    #[JsonProperty('optionalObject')]
    public ?Organization $optionalObject;

    /**
     * @param array{
     *   requiredString: string,
     *   nullableEnum: value-of<UserRole>,
     *   nullableUnion: (
     *    NotificationMethodZero
     *   |NotificationMethodOne
     *   |NotificationMethodTwo
     * ),
     *   nullableObject: Address,
     *   nullableString?: ?string,
     *   optionalString?: ?string,
     *   optionalNullableString?: ?string,
     *   optionalEnum?: ?value-of<UserStatus>,
     *   optionalUnion?: (
     *    SearchResultZero
     *   |SearchResultOne
     *   |SearchResultTwo
     * )|null,
     *   nullableList?: ?array<string>,
     *   nullableMap?: ?array<string, ?int>,
     *   optionalObject?: ?Organization,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->requiredString = $values['requiredString'];
        $this->nullableString = $values['nullableString'] ?? null;
        $this->optionalString = $values['optionalString'] ?? null;
        $this->optionalNullableString = $values['optionalNullableString'] ?? null;
        $this->nullableEnum = $values['nullableEnum'];
        $this->optionalEnum = $values['optionalEnum'] ?? null;
        $this->nullableUnion = $values['nullableUnion'];
        $this->optionalUnion = $values['optionalUnion'] ?? null;
        $this->nullableList = $values['nullableList'] ?? null;
        $this->nullableMap = $values['nullableMap'] ?? null;
        $this->nullableObject = $values['nullableObject'];
        $this->optionalObject = $values['optionalObject'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
