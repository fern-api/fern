<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class TestCaseImplementationDescriptionBoard extends JsonSerializableType
{
    /**
     * @var (
     *    'html'
     *   |'paramId'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    string
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'html'
     *   |'paramId'
     *   |'_unknown'
     * ),
     *   value: (
     *    string
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
     * @param string $html
     * @return TestCaseImplementationDescriptionBoard
     */
    public static function html(string $html): TestCaseImplementationDescriptionBoard {
        return new TestCaseImplementationDescriptionBoard([
            'type' => 'html',
            'value' => $html,
        ]);
    }

    /**
     * @param string $paramId
     * @return TestCaseImplementationDescriptionBoard
     */
    public static function paramId(string $paramId): TestCaseImplementationDescriptionBoard {
        return new TestCaseImplementationDescriptionBoard([
            'type' => 'paramId',
            'value' => $paramId,
        ]);
    }

    /**
     * @return bool
     */
    public function isHtml(): bool {
        return is_string($this->value)&& $this->type === 'html';
    }

    /**
     * @return string
     */
    public function asHtml(): string {
        if (!(is_string($this->value)&& $this->type === 'html')){
            throw new Exception(
                "Expected html; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isParamId(): bool {
        return is_string($this->value)&& $this->type === 'paramId';
    }

    /**
     * @return string
     */
    public function asParamId(): string {
        if (!(is_string($this->value)&& $this->type === 'paramId')){
            throw new Exception(
                "Expected paramId; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'html':
                $value = $this->value;
                $result['html'] = $value;
                break;
            case 'paramId':
                $value = $this->value;
                $result['paramId'] = $value;
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
            case 'html':
                if (!array_key_exists('html', $data)){
                    throw new Exception(
                        "JSON data is missing property 'html'",
                    );
                }
                
                $args['value'] = $data['html'];
                break;
            case 'paramId':
                if (!array_key_exists('paramId', $data)){
                    throw new Exception(
                        "JSON data is missing property 'paramId'",
                    );
                }
                
                $args['value'] = $data['paramId'];
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
