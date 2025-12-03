<?php

namespace Seed\Inlined;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class DiscriminatedLiteral extends JsonSerializableType
{
    /**
     * @var (
     *    'customName'
     *   |'defaultName'
     *   |'george'
     *   |'literalGeorge'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    string
     *   |'Bob'
     *   |bool
     *   |true
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'customName'
     *   |'defaultName'
     *   |'george'
     *   |'literalGeorge'
     *   |'_unknown'
     * ),
     *   value: (
     *    string
     *   |'Bob'
     *   |bool
     *   |true
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
     * @param string $customName
     * @return DiscriminatedLiteral
     */
    public static function customName(string $customName): DiscriminatedLiteral {
        return new DiscriminatedLiteral([
            'type' => 'customName',
            'value' => $customName,
        ]);
    }

    /**
     * @param 'Bob' $defaultName
     * @return DiscriminatedLiteral
     */
    public static function defaultName(string $defaultName): DiscriminatedLiteral {
        return new DiscriminatedLiteral([
            'type' => 'defaultName',
            'value' => $defaultName,
        ]);
    }

    /**
     * @param bool $george
     * @return DiscriminatedLiteral
     */
    public static function george(bool $george): DiscriminatedLiteral {
        return new DiscriminatedLiteral([
            'type' => 'george',
            'value' => $george,
        ]);
    }

    /**
     * @param true $literalGeorge
     * @return DiscriminatedLiteral
     */
    public static function literalGeorge(bool $literalGeorge): DiscriminatedLiteral {
        return new DiscriminatedLiteral([
            'type' => 'literalGeorge',
            'value' => $literalGeorge,
        ]);
    }

    /**
     * @return bool
     */
    public function isCustomName(): bool {
        return is_string($this->value)&& $this->type === 'customName';
    }

    /**
     * @return string
     */
    public function asCustomName(): string {
        if (!(is_string($this->value)&& $this->type === 'customName')){
            throw new Exception(
                "Expected customName; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isDefaultName(): bool {
        return $this->value === 'Bob'&& $this->type === 'defaultName';
    }

    /**
     * @return 'Bob'
     */
    public function asDefaultName(): string {
        if (!($this->value === 'Bob'&& $this->type === 'defaultName')){
            throw new Exception(
                "Expected defaultName; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isGeorge(): bool {
        return is_bool($this->value)&& $this->type === 'george';
    }

    /**
     * @return bool
     */
    public function asGeorge(): bool {
        if (!(is_bool($this->value)&& $this->type === 'george')){
            throw new Exception(
                "Expected george; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isLiteralGeorge(): bool {
        return $this->value === true&& $this->type === 'literalGeorge';
    }

    /**
     * @return true
     */
    public function asLiteralGeorge(): bool {
        if (!($this->value === true&& $this->type === 'literalGeorge')){
            throw new Exception(
                "Expected literalGeorge; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'customName':
                $value = $this->value;
                $result['customName'] = $value;
                break;
            case 'defaultName':
                $value = $this->value;
                $result['defaultName'] = $value;
                break;
            case 'george':
                $value = $this->value;
                $result['george'] = $value;
                break;
            case 'literalGeorge':
                $value = $this->value;
                $result['literalGeorge'] = $value;
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
            case 'customName':
                if (!array_key_exists('customName', $data)){
                    throw new Exception(
                        "JSON data is missing property 'customName'",
                    );
                }
                
                $args['value'] = $data['customName'];
                break;
            case 'defaultName':
                if (!array_key_exists('defaultName', $data)){
                    throw new Exception(
                        "JSON data is missing property 'defaultName'",
                    );
                }
                
                $args['value'] = $data['defaultName'];
                break;
            case 'george':
                if (!array_key_exists('george', $data)){
                    throw new Exception(
                        "JSON data is missing property 'george'",
                    );
                }
                
                $args['value'] = $data['george'];
                break;
            case 'literalGeorge':
                if (!array_key_exists('literalGeorge', $data)){
                    throw new Exception(
                        "JSON data is missing property 'literalGeorge'",
                    );
                }
                
                $args['value'] = $data['literalGeorge'];
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
