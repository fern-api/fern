<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class TypeWithOptionalMap extends JsonSerializableType
{
    /**
     * @var string $key
     */
    #[JsonProperty('key')]
    private string $key;

    /**
     * @var array<string, ?string> $columnValues
     */
    #[JsonProperty('columnValues'), ArrayType(['string' => new Union('string', 'null')])]
    private array $columnValues;

    /**
     * @param array{
     *   key: string,
     *   columnValues: array<string, ?string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->key = $values['key'];
        $this->columnValues = $values['columnValues'];
    }

    /**
     * @return string
     */
    public function getKey(): string
    {
        return $this->key;
    }

    /**
     * @param string $value
     */
    public function setKey(string $value): self
    {
        $this->key = $value;
        $this->_setField('key');
        return $this;
    }

    /**
     * @return array<string, ?string>
     */
    public function getColumnValues(): array
    {
        return $this->columnValues;
    }

    /**
     * @param array<string, ?string> $value
     */
    public function setColumnValues(array $value): self
    {
        $this->columnValues = $value;
        $this->_setField('columnValues');
        return $this;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
