<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class DebugKeyValuePairs extends JsonSerializableType
{
    /**
     * @var (
     *    DebugVariableValueZero
     *   |DebugVariableValueOne
     *   |DebugVariableValueTwo
     *   |DebugVariableValueThree
     *   |DebugVariableValueFour
     *   |DebugVariableValueFive
     *   |DebugVariableValueSix
     *   |DebugVariableValueSeven
     *   |DebugVariableValueEight
     *   |DebugVariableValueNine
     *   |DebugVariableValueTen
     *   |DebugVariableValueEleven
     *   |DebugVariableValueTwelve
     * ) $key
     */
    #[JsonProperty('key'), Union(DebugVariableValueZero::class, DebugVariableValueOne::class, DebugVariableValueTwo::class, DebugVariableValueThree::class, DebugVariableValueFour::class, DebugVariableValueFive::class, DebugVariableValueSix::class, DebugVariableValueSeven::class, DebugVariableValueEight::class, DebugVariableValueNine::class, DebugVariableValueTen::class, DebugVariableValueEleven::class, DebugVariableValueTwelve::class)]
    public DebugVariableValueZero|DebugVariableValueOne|DebugVariableValueTwo|DebugVariableValueThree|DebugVariableValueFour|DebugVariableValueFive|DebugVariableValueSix|DebugVariableValueSeven|DebugVariableValueEight|DebugVariableValueNine|DebugVariableValueTen|DebugVariableValueEleven|DebugVariableValueTwelve $key;

    /**
     * @var (
     *    DebugVariableValueZero
     *   |DebugVariableValueOne
     *   |DebugVariableValueTwo
     *   |DebugVariableValueThree
     *   |DebugVariableValueFour
     *   |DebugVariableValueFive
     *   |DebugVariableValueSix
     *   |DebugVariableValueSeven
     *   |DebugVariableValueEight
     *   |DebugVariableValueNine
     *   |DebugVariableValueTen
     *   |DebugVariableValueEleven
     *   |DebugVariableValueTwelve
     * ) $value
     */
    #[JsonProperty('value'), Union(DebugVariableValueZero::class, DebugVariableValueOne::class, DebugVariableValueTwo::class, DebugVariableValueThree::class, DebugVariableValueFour::class, DebugVariableValueFive::class, DebugVariableValueSix::class, DebugVariableValueSeven::class, DebugVariableValueEight::class, DebugVariableValueNine::class, DebugVariableValueTen::class, DebugVariableValueEleven::class, DebugVariableValueTwelve::class)]
    public DebugVariableValueZero|DebugVariableValueOne|DebugVariableValueTwo|DebugVariableValueThree|DebugVariableValueFour|DebugVariableValueFive|DebugVariableValueSix|DebugVariableValueSeven|DebugVariableValueEight|DebugVariableValueNine|DebugVariableValueTen|DebugVariableValueEleven|DebugVariableValueTwelve $value;

    /**
     * @param array{
     *   key: (
     *    DebugVariableValueZero
     *   |DebugVariableValueOne
     *   |DebugVariableValueTwo
     *   |DebugVariableValueThree
     *   |DebugVariableValueFour
     *   |DebugVariableValueFive
     *   |DebugVariableValueSix
     *   |DebugVariableValueSeven
     *   |DebugVariableValueEight
     *   |DebugVariableValueNine
     *   |DebugVariableValueTen
     *   |DebugVariableValueEleven
     *   |DebugVariableValueTwelve
     * ),
     *   value: (
     *    DebugVariableValueZero
     *   |DebugVariableValueOne
     *   |DebugVariableValueTwo
     *   |DebugVariableValueThree
     *   |DebugVariableValueFour
     *   |DebugVariableValueFive
     *   |DebugVariableValueSix
     *   |DebugVariableValueSeven
     *   |DebugVariableValueEight
     *   |DebugVariableValueNine
     *   |DebugVariableValueTen
     *   |DebugVariableValueEleven
     *   |DebugVariableValueTwelve
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->key = $values['key'];
        $this->value = $values['value'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
