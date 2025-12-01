<?php

namespace Seed\NullableOptional;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

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
     * @var ?value-of<UserRole> $nullableRole
     */
    #[JsonProperty('nullableRole')]
    public ?string $nullableRole;

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
     * @var ?value-of<UserStatus> $nullableStatus
     */
    #[JsonProperty('nullableStatus')]
    public ?string $nullableStatus;

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
     * @var ?NotificationMethod $nullableNotification
     */
    #[JsonProperty('nullableNotification')]
    public ?NotificationMethod $nullableNotification;

    /**
     * @var ?NotificationMethod $optionalNotification
     */
    #[JsonProperty('optionalNotification')]
    public ?NotificationMethod $optionalNotification;

    /**
     * @var ?NotificationMethod $optionalNullableNotification
     */
    #[JsonProperty('optionalNullableNotification')]
    public ?NotificationMethod $optionalNullableNotification;

    /**
     * @var ?SearchResult $nullableSearchResult
     */
    #[JsonProperty('nullableSearchResult')]
    public ?SearchResult $nullableSearchResult;

    /**
     * @var ?SearchResult $optionalSearchResult
     */
    #[JsonProperty('optionalSearchResult')]
    public ?SearchResult $optionalSearchResult;

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
     * @var ?array<NotificationMethod> $nullableListOfUnions
     */
    #[JsonProperty('nullableListOfUnions'), ArrayType([NotificationMethod::class])]
    public ?array $nullableListOfUnions;

    /**
     * @var ?array<string, value-of<UserRole>> $optionalMapOfEnums
     */
    #[JsonProperty('optionalMapOfEnums'), ArrayType(['string' => 'string'])]
    public ?array $optionalMapOfEnums;

    /**
     * @param array{
     *   id: string,
     *   nullableRole?: ?value-of<UserRole>,
     *   optionalRole?: ?value-of<UserRole>,
     *   optionalNullableRole?: ?value-of<UserRole>,
     *   nullableStatus?: ?value-of<UserStatus>,
     *   optionalStatus?: ?value-of<UserStatus>,
     *   optionalNullableStatus?: ?value-of<UserStatus>,
     *   nullableNotification?: ?NotificationMethod,
     *   optionalNotification?: ?NotificationMethod,
     *   optionalNullableNotification?: ?NotificationMethod,
     *   nullableSearchResult?: ?SearchResult,
     *   optionalSearchResult?: ?SearchResult,
     *   nullableArray?: ?array<string>,
     *   optionalArray?: ?array<string>,
     *   optionalNullableArray?: ?array<string>,
     *   nullableListOfNullables?: ?array<?string>,
     *   nullableMapOfNullables?: ?array<string, ?Address>,
     *   nullableListOfUnions?: ?array<NotificationMethod>,
     *   optionalMapOfEnums?: ?array<string, value-of<UserRole>>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->nullableRole = $values['nullableRole'] ?? null;$this->optionalRole = $values['optionalRole'] ?? null;$this->optionalNullableRole = $values['optionalNullableRole'] ?? null;$this->nullableStatus = $values['nullableStatus'] ?? null;$this->optionalStatus = $values['optionalStatus'] ?? null;$this->optionalNullableStatus = $values['optionalNullableStatus'] ?? null;$this->nullableNotification = $values['nullableNotification'] ?? null;$this->optionalNotification = $values['optionalNotification'] ?? null;$this->optionalNullableNotification = $values['optionalNullableNotification'] ?? null;$this->nullableSearchResult = $values['nullableSearchResult'] ?? null;$this->optionalSearchResult = $values['optionalSearchResult'] ?? null;$this->nullableArray = $values['nullableArray'] ?? null;$this->optionalArray = $values['optionalArray'] ?? null;$this->optionalNullableArray = $values['optionalNullableArray'] ?? null;$this->nullableListOfNullables = $values['nullableListOfNullables'] ?? null;$this->nullableMapOfNullables = $values['nullableMapOfNullables'] ?? null;$this->nullableListOfUnions = $values['nullableListOfUnions'] ?? null;$this->optionalMapOfEnums = $values['optionalMapOfEnums'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
