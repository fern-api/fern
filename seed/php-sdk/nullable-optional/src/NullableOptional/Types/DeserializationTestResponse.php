<?php

namespace Seed\NullableOptional\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;

/**
 * Response for deserialization test
 */
class DeserializationTestResponse extends JsonSerializableType
{
    /**
     * @var DeserializationTestRequest $echo
     */
    #[JsonProperty('echo')]
    public DeserializationTestRequest $echo;

    /**
     * @var DateTime $processedAt
     */
    #[JsonProperty('processedAt'), Date(Date::TYPE_DATETIME)]
    public DateTime $processedAt;

    /**
     * @var int $nullCount
     */
    #[JsonProperty('nullCount')]
    public int $nullCount;

    /**
     * @var int $presentFieldsCount
     */
    #[JsonProperty('presentFieldsCount')]
    public int $presentFieldsCount;

    /**
     * @param array{
     *   echo: DeserializationTestRequest,
     *   processedAt: DateTime,
     *   nullCount: int,
     *   presentFieldsCount: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->echo = $values['echo'];$this->processedAt = $values['processedAt'];$this->nullCount = $values['nullCount'];$this->presentFieldsCount = $values['presentFieldsCount'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
