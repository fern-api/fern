<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class TestCaseFunction extends JsonSerializableType
{
    /**
     * @var (
     *    'withActualResult'
     *   |'custom'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    TestCaseWithActualResultImplementation
     *   |VoidFunctionDefinition
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'withActualResult'
     *   |'custom'
     *   |'_unknown'
     * ),
     *   value: (
     *    TestCaseWithActualResultImplementation
     *   |VoidFunctionDefinition
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->type = $values['type'];$this->value = $values['value'];
    }

    /**
     * @param TestCaseWithActualResultImplementation $withActualResult
     * @return TestCaseFunction
     */
    public static function withActualResult(TestCaseWithActualResultImplementation $withActualResult): TestCaseFunction {
        return new TestCaseFunction([
            'type' => 'withActualResult',
            'value' => $withActualResult,
        ]);
    }

    /**
     * @param VoidFunctionDefinition $custom
     * @return TestCaseFunction
     */
    public static function custom(VoidFunctionDefinition $custom): TestCaseFunction {
        return new TestCaseFunction([
            'type' => 'custom',
            'value' => $custom,
        ]);
    }

    /**
     * @return bool
     */
    public function isWithActualResult(): bool {
        return $this->value instanceof TestCaseWithActualResultImplementation&& $this->type === 'withActualResult';
    }

    /**
     * @return TestCaseWithActualResultImplementation
     */
    public function asWithActualResult(): TestCaseWithActualResultImplementation {
        if (!($this->value instanceof TestCaseWithActualResultImplementation&& $this->type === 'withActualResult')){
            throw new Exception(
                "Expected withActualResult; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isCustom(): bool {
        return $this->value instanceof VoidFunctionDefinition&& $this->type === 'custom';
    }

    /**
     * @return VoidFunctionDefinition
     */
    public function asCustom(): VoidFunctionDefinition {
        if (!($this->value instanceof VoidFunctionDefinition&& $this->type === 'custom')){
            throw new Exception(
                "Expected custom; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array {
        $result = [];
        $result['type'] = $this->type;
        
        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);
        
        switch ($this->type){
            case 'withActualResult':
                $value = $this->asWithActualResult()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'custom':
                $value = $this->asCustom()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)){
                    break;
                }
                if ($this->value instanceof JsonSerializableType){
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)){
                    $result = array_merge($this->value, $result);
                }
        }
        
        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)){
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static {
        $args = [];
        if (!array_key_exists('type', $data)){
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))){
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }
        
        $args['type'] = $type;
        switch ($type){
            case 'withActualResult':
                $args['value'] = TestCaseWithActualResultImplementation::jsonDeserialize($data);
                break;
            case 'custom':
                $args['value'] = VoidFunctionDefinition::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['type'] = '_unknown';
                $args['value'] = $data;
        }
        
        // @phpstan-ignore-next-line
        return new static($args);
    }
}
