<?php

namespace Seed\Commons\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class EventInfo extends JsonSerializableType
{
    /**
     * @var (
     *    'metadata'
     *   |'tag'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    Metadata
     *   |string
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'metadata'
     *   |'tag'
     *   |'_unknown'
     * ),
     *   value: (
     *    Metadata
     *   |string
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
     * @param Metadata $metadata
     * @return EventInfo
     */
    public static function metadata(Metadata $metadata): EventInfo {
        return new EventInfo([
            'type' => 'metadata',
            'value' => $metadata,
        ]);
    }

    /**
     * @param string $tag
     * @return EventInfo
     */
    public static function tag(string $tag): EventInfo {
        return new EventInfo([
            'type' => 'tag',
            'value' => $tag,
        ]);
    }

    /**
     * @return bool
     */
    public function isMetadata(): bool {
        return $this->value instanceof Metadata&& $this->type === 'metadata';
    }

    /**
     * @return Metadata
     */
    public function asMetadata(): Metadata {
        if (!($this->value instanceof Metadata&& $this->type === 'metadata')){
            throw new Exception(
                "Expected metadata; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isTag(): bool {
        return is_string($this->value)&& $this->type === 'tag';
    }

    /**
     * @return string
     */
    public function asTag(): string {
        if (!(is_string($this->value)&& $this->type === 'tag')){
            throw new Exception(
                "Expected tag; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'metadata':
                $value = $this->asMetadata()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'tag':
                $value = $this->value;
                $result['tag'] = $value;
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
            case 'metadata':
                $args['value'] = Metadata::jsonDeserialize($data);
                break;
            case 'tag':
                if (!array_key_exists('tag', $data)){
                    throw new Exception(
                        "JSON data is missing property 'tag'",
                    );
                }
                
                $args['value'] = $data['tag'];
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
