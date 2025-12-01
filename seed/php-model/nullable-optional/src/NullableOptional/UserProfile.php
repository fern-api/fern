<?php

namespace Seed\NullableOptional;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;
use Seed\Core\Types\ArrayType;

/**
 * Test object with nullable and optional fields
 */
class UserProfile extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var string $username
     */
    #[JsonProperty('username')]
    public string $username;

    /**
     * @var ?string $nullableString
     */
    #[JsonProperty('nullableString')]
    public ?string $nullableString;

    /**
     * @var ?int $nullableInteger
     */
    #[JsonProperty('nullableInteger')]
    public ?int $nullableInteger;

    /**
     * @var ?bool $nullableBoolean
     */
    #[JsonProperty('nullableBoolean')]
    public ?bool $nullableBoolean;

    /**
     * @var ?DateTime $nullableDate
     */
    #[JsonProperty('nullableDate'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $nullableDate;

    /**
     * @var ?Address $nullableObject
     */
    #[JsonProperty('nullableObject')]
    public ?Address $nullableObject;

    /**
     * @var ?array<string> $nullableList
     */
    #[JsonProperty('nullableList'), ArrayType(['string'])]
    public ?array $nullableList;

    /**
     * @var ?array<string, string> $nullableMap
     */
    #[JsonProperty('nullableMap'), ArrayType(['string' => 'string'])]
    public ?array $nullableMap;

    /**
     * @var ?string $optionalString
     */
    #[JsonProperty('optionalString')]
    public ?string $optionalString;

    /**
     * @var ?int $optionalInteger
     */
    #[JsonProperty('optionalInteger')]
    public ?int $optionalInteger;

    /**
     * @var ?bool $optionalBoolean
     */
    #[JsonProperty('optionalBoolean')]
    public ?bool $optionalBoolean;

    /**
     * @var ?DateTime $optionalDate
     */
    #[JsonProperty('optionalDate'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $optionalDate;

    /**
     * @var ?Address $optionalObject
     */
    #[JsonProperty('optionalObject')]
    public ?Address $optionalObject;

    /**
     * @var ?array<string> $optionalList
     */
    #[JsonProperty('optionalList'), ArrayType(['string'])]
    public ?array $optionalList;

    /**
     * @var ?array<string, string> $optionalMap
     */
    #[JsonProperty('optionalMap'), ArrayType(['string' => 'string'])]
    public ?array $optionalMap;

    /**
     * @var ?string $optionalNullableString
     */
    #[JsonProperty('optionalNullableString')]
    public ?string $optionalNullableString;

    /**
     * @var ?Address $optionalNullableObject
     */
    #[JsonProperty('optionalNullableObject')]
    public ?Address $optionalNullableObject;

    /**
     * @param array{
     *   id: string,
     *   username: string,
     *   nullableString?: ?string,
     *   nullableInteger?: ?int,
     *   nullableBoolean?: ?bool,
     *   nullableDate?: ?DateTime,
     *   nullableObject?: ?Address,
     *   nullableList?: ?array<string>,
     *   nullableMap?: ?array<string, string>,
     *   optionalString?: ?string,
     *   optionalInteger?: ?int,
     *   optionalBoolean?: ?bool,
     *   optionalDate?: ?DateTime,
     *   optionalObject?: ?Address,
     *   optionalList?: ?array<string>,
     *   optionalMap?: ?array<string, string>,
     *   optionalNullableString?: ?string,
     *   optionalNullableObject?: ?Address,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->username = $values['username'];$this->nullableString = $values['nullableString'] ?? null;$this->nullableInteger = $values['nullableInteger'] ?? null;$this->nullableBoolean = $values['nullableBoolean'] ?? null;$this->nullableDate = $values['nullableDate'] ?? null;$this->nullableObject = $values['nullableObject'] ?? null;$this->nullableList = $values['nullableList'] ?? null;$this->nullableMap = $values['nullableMap'] ?? null;$this->optionalString = $values['optionalString'] ?? null;$this->optionalInteger = $values['optionalInteger'] ?? null;$this->optionalBoolean = $values['optionalBoolean'] ?? null;$this->optionalDate = $values['optionalDate'] ?? null;$this->optionalObject = $values['optionalObject'] ?? null;$this->optionalList = $values['optionalList'] ?? null;$this->optionalMap = $values['optionalMap'] ?? null;$this->optionalNullableString = $values['optionalNullableString'] ?? null;$this->optionalNullableObject = $values['optionalNullableObject'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
