<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class TestCaseImplementationReference extends JsonSerializableType
{
    /**
     * @var (
     *    'templateId'
     *   |'implementation'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    string
     *   |TestCaseImplementation
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'templateId'
     *   |'implementation'
     *   |'_unknown'
     * ),
     *   value: (
     *    string
     *   |TestCaseImplementation
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
     * @param string $templateId
     * @return TestCaseImplementationReference
     */
    public static function templateId(string $templateId): TestCaseImplementationReference {
        return new TestCaseImplementationReference([
            'type' => 'templateId',
            'value' => $templateId,
        ]);
    }

    /**
     * @param TestCaseImplementation $implementation
     * @return TestCaseImplementationReference
     */
    public static function implementation(TestCaseImplementation $implementation): TestCaseImplementationReference {
        return new TestCaseImplementationReference([
            'type' => 'implementation',
            'value' => $implementation,
        ]);
    }

    /**
     * @return bool
     */
    public function isTemplateId(): bool {
        return is_string($this->value)&& $this->type === 'templateId';
    }

    /**
     * @return string
     */
    public function asTemplateId(): string {
        if (!(is_string($this->value)&& $this->type === 'templateId')){
            throw new Exception(
                "Expected templateId; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isImplementation(): bool {
        return $this->value instanceof TestCaseImplementation&& $this->type === 'implementation';
    }

    /**
     * @return TestCaseImplementation
     */
    public function asImplementation(): TestCaseImplementation {
        if (!($this->value instanceof TestCaseImplementation&& $this->type === 'implementation')){
            throw new Exception(
                "Expected implementation; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'templateId':
                $value = $this->value;
                $result['templateId'] = $value;
                break;
            case 'implementation':
                $value = $this->asImplementation()->jsonSerialize();
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
            case 'templateId':
                if (!array_key_exists('templateId', $data)){
                    throw new Exception(
                        "JSON data is missing property 'templateId'",
                    );
                }
                
                $args['value'] = $data['templateId'];
                break;
            case 'implementation':
                $args['value'] = TestCaseImplementation::jsonDeserialize($data);
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
