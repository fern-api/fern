<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class Metadata extends JsonSerializableType
{
    /**
     * @var array<string, string> $extra
     */
    #[JsonProperty('extra'), ArrayType(['string' => 'string'])]
    public array $extra;

    /**
     * @var array<string> $tags
     */
    #[JsonProperty('tags'), ArrayType(['string'])]
    public array $tags;

    /**
     * @var (
     *    'html'
     *   |'markdown'
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
     *   extra: array<string, string>,
     *   tags: array<string>,
     *   type: (
     *    'html'
     *   |'markdown'
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
        $this->extra = $values['extra'];$this->tags = $values['tags'];$this->type = $values['type'];$this->value = $values['value'];
    }

    /**
     * @param array<string, string> $extra
     * @param array<string> $tags
     * @param string $html
     * @return Metadata
     */
    public static function html(array $extra, array $tags, string $html): Metadata {
        return new Metadata([
            'extra' => $extra,
            'tags' => $tags,
            'type' => 'html',
            'value' => $html,
        ]);
    }

    /**
     * @param array<string, string> $extra
     * @param array<string> $tags
     * @param string $markdown
     * @return Metadata
     */
    public static function markdown(array $extra, array $tags, string $markdown): Metadata {
        return new Metadata([
            'extra' => $extra,
            'tags' => $tags,
            'type' => 'markdown',
            'value' => $markdown,
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
    public function isMarkdown(): bool {
        return is_string($this->value)&& $this->type === 'markdown';
    }

    /**
     * @return string
     */
    public function asMarkdown(): string {
        if (!(is_string($this->value)&& $this->type === 'markdown')){
            throw new Exception(
                "Expected markdown; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'markdown':
                $value = $this->value;
                $result['markdown'] = $value;
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
        if (!array_key_exists('extra', $data)){
            throw new Exception(
                "JSON data is missing property 'extra'",
            );
        }
        if (!(is_array($data['extra']))){
            throw new Exception(
                "Expected property 'extra' in JSON data to be map, instead received " . get_debug_type($data['extra']),
            );
        }
        $args['extra'] = $data['extra'];
        
        if (!array_key_exists('tags', $data)){
            throw new Exception(
                "JSON data is missing property 'tags'",
            );
        }
        if (!(is_array($data['tags']))){
            throw new Exception(
                "Expected property 'tags' in JSON data to be array, instead received " . get_debug_type($data['tags']),
            );
        }
        $args['tags'] = $data['tags'];
        
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
            case 'markdown':
                if (!array_key_exists('markdown', $data)){
                    throw new Exception(
                        "JSON data is missing property 'markdown'",
                    );
                }
                
                $args['value'] = $data['markdown'];
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
