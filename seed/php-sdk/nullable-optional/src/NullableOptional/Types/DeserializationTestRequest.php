<?php

namespace Seed\NullableOptional\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
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
     * @var ?value-of<UserRole> $nullableEnum
     */
    #[JsonProperty('nullableEnum')]
    public ?string $nullableEnum;

    /**
     * @var ?value-of<UserStatus> $optionalEnum
     */
    #[JsonProperty('optionalEnum')]
    public ?string $optionalEnum;

    /**
     * @var ?NotificationMethod $nullableUnion
     */
    #[JsonProperty('nullableUnion')]
    public ?NotificationMethod $nullableUnion;

    /**
     * @var ?SearchResult $optionalUnion
     */
    #[JsonProperty('optionalUnion')]
    public ?SearchResult $optionalUnion;

    /**
     * @var ?array<string> $nullableList
     */
    #[JsonProperty('nullableList'), ArrayType(['string'])]
    public ?array $nullableList;

    /**
     * @var ?array<string, int> $nullableMap
     */
    #[JsonProperty('nullableMap'), ArrayType(['string' => 'integer'])]
    public ?array $nullableMap;

    /**
     * @var ?Address $nullableObject
     */
    #[JsonProperty('nullableObject')]
    public ?Address $nullableObject;

    /**
     * @var ?Organization $optionalObject
     */
    #[JsonProperty('optionalObject')]
    public ?Organization $optionalObject;

    /**
     * @param array{
     *   requiredString: string,
     *   nullableString?: ?string,
     *   optionalString?: ?string,
     *   optionalNullableString?: ?string,
     *   nullableEnum?: ?value-of<UserRole>,
     *   optionalEnum?: ?value-of<UserStatus>,
     *   nullableUnion?: ?NotificationMethod,
     *   optionalUnion?: ?SearchResult,
     *   nullableList?: ?array<string>,
     *   nullableMap?: ?array<string, int>,
     *   nullableObject?: ?Address,
     *   optionalObject?: ?Organization,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->requiredString = $values['requiredString'];$this->nullableString = $values['nullableString'] ?? null;$this->optionalString = $values['optionalString'] ?? null;$this->optionalNullableString = $values['optionalNullableString'] ?? null;$this->nullableEnum = $values['nullableEnum'] ?? null;$this->optionalEnum = $values['optionalEnum'] ?? null;$this->nullableUnion = $values['nullableUnion'] ?? null;$this->optionalUnion = $values['optionalUnion'] ?? null;$this->nullableList = $values['nullableList'] ?? null;$this->nullableMap = $values['nullableMap'] ?? null;$this->nullableObject = $values['nullableObject'] ?? null;$this->optionalObject = $values['optionalObject'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
