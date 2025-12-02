<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class TestCaseGrade extends JsonSerializableType
{
    /**
     * @var (
     *    'hidden'
     *   |'nonHidden'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    TestCaseHiddenGrade
     *   |TestCaseNonHiddenGrade
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'hidden'
     *   |'nonHidden'
     *   |'_unknown'
     * ),
     *   value: (
     *    TestCaseHiddenGrade
     *   |TestCaseNonHiddenGrade
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
     * @param TestCaseHiddenGrade $hidden
     * @return TestCaseGrade
     */
    public static function hidden(TestCaseHiddenGrade $hidden): TestCaseGrade {
        return new TestCaseGrade([
            'type' => 'hidden',
            'value' => $hidden,
        ]);
    }

    /**
     * @param TestCaseNonHiddenGrade $nonHidden
     * @return TestCaseGrade
     */
    public static function nonHidden(TestCaseNonHiddenGrade $nonHidden): TestCaseGrade {
        return new TestCaseGrade([
            'type' => 'nonHidden',
            'value' => $nonHidden,
        ]);
    }

    /**
     * @return bool
     */
    public function isHidden(): bool {
        return $this->value instanceof TestCaseHiddenGrade&& $this->type === 'hidden';
    }

    /**
     * @return TestCaseHiddenGrade
     */
    public function asHidden(): TestCaseHiddenGrade {
        if (!($this->value instanceof TestCaseHiddenGrade&& $this->type === 'hidden')){
            throw new Exception(
                "Expected hidden; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isNonHidden(): bool {
        return $this->value instanceof TestCaseNonHiddenGrade&& $this->type === 'nonHidden';
    }

    /**
     * @return TestCaseNonHiddenGrade
     */
    public function asNonHidden(): TestCaseNonHiddenGrade {
        if (!($this->value instanceof TestCaseNonHiddenGrade&& $this->type === 'nonHidden')){
            throw new Exception(
                "Expected nonHidden; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'hidden':
                $value = $this->asHidden()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'nonHidden':
                $value = $this->asNonHidden()->jsonSerialize();
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
            case 'hidden':
                $args['value'] = TestCaseHiddenGrade::jsonDeserialize($data);
                break;
            case 'nonHidden':
                $args['value'] = TestCaseNonHiddenGrade::jsonDeserialize($data);
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
