<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Commons\Types\Language;
use Exception;
use Seed\Core\Json\JsonDecoder;

class CustomFiles extends JsonSerializableType
{
    /**
     * @var (
     *    'basic'
     *   |'custom'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    BasicCustomFiles
     *   |array<value-of<Language>, Files>
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'basic'
     *   |'custom'
     *   |'_unknown'
     * ),
     *   value: (
     *    BasicCustomFiles
     *   |array<value-of<Language>, Files>
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
     * @param BasicCustomFiles $basic
     * @return CustomFiles
     */
    public static function basic(BasicCustomFiles $basic): CustomFiles {
        return new CustomFiles([
            'type' => 'basic',
            'value' => $basic,
        ]);
    }

    /**
     * @param array<value-of<Language>, Files> $custom
     * @return CustomFiles
     */
    public static function custom(array $custom): CustomFiles {
        return new CustomFiles([
            'type' => 'custom',
            'value' => $custom,
        ]);
    }

    /**
     * @return bool
     */
    public function isBasic(): bool {
        return $this->value instanceof BasicCustomFiles&& $this->type === 'basic';
    }

    /**
     * @return BasicCustomFiles
     */
    public function asBasic(): BasicCustomFiles {
        if (!($this->value instanceof BasicCustomFiles&& $this->type === 'basic')){
            throw new Exception(
                "Expected basic; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isCustom(): bool {
        return is_array($this->value)&& $this->type === 'custom';
    }

    /**
     * @return array<value-of<Language>, Files>
     */
    public function asCustom(): array {
        if (!(is_array($this->value)&& $this->type === 'custom')){
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
            case 'basic':
                $value = $this->asBasic()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'custom':
                $value = $this->value;
                $result['custom'] = $value;
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
            case 'basic':
                $args['value'] = BasicCustomFiles::jsonDeserialize($data);
                break;
            case 'custom':
                if (!array_key_exists('custom', $data)){
                    throw new Exception(
                        "JSON data is missing property 'custom'",
                    );
                }
                
                $args['value'] = $data['custom'];
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
