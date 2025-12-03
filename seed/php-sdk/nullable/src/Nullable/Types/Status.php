<?php

namespace Seed\Nullable\Types;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Exception;
use Seed\Core\Json\JsonSerializer;
use Seed\Core\Json\JsonDecoder;

class Status extends JsonSerializableType
{
    /**
     * @var (
     *    'active'
     *   |'archived'
     *   |'soft-deleted'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    null
     *   |DateTime
     *   |mixed
     *   |null
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'active'
     *   |'archived'
     *   |'soft-deleted'
     *   |'_unknown'
     * ),
     *   value: (
     *    null
     *   |DateTime
     *   |mixed
     *   |null
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
     * @return Status
     */
    public static function active(): Status {
        return new Status([
            'type' => 'active',
            'value' => null,
        ]);
    }

    /**
     * @param ?DateTime $archived
     * @return Status
     */
    public static function archived(?DateTime $archived = null): Status {
        return new Status([
            'type' => 'archived',
            'value' => $archived,
        ]);
    }

    /**
     * @param ?DateTime $softDeleted
     * @return Status
     */
    public static function softDeleted(?DateTime $softDeleted = null): Status {
        return new Status([
            'type' => 'soft-deleted',
            'value' => $softDeleted,
        ]);
    }

    /**
     * @return bool
     */
    public function isActive(): bool {
        return is_null($this->value)&& $this->type === 'active';
    }

    /**
     * @return bool
     */
    public function isArchived(): bool {
        return (is_null($this->value) || $this->value instanceof DateTime)&& $this->type === 'archived';
    }

    /**
     * @return ?DateTime
     */
    public function asArchived(): ?DateTime {
        if (!((is_null($this->value) || $this->value instanceof DateTime)&& $this->type === 'archived')){
            throw new Exception(
                "Expected archived; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isSoftDeleted(): bool {
        return (is_null($this->value) || $this->value instanceof DateTime)&& $this->type === 'soft-deleted';
    }

    /**
     * @return ?DateTime
     */
    public function asSoftDeleted(): ?DateTime {
        if (!((is_null($this->value) || $this->value instanceof DateTime)&& $this->type === 'soft-deleted')){
            throw new Exception(
                "Expected soft-deleted; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'active':
                $result['active'] = [];
                break;
            case 'archived':
                $value = $this->asArchived();
                if (!is_null($value)){
                    $value = JsonSerializer::serializeDateTime($value);
                }
                $result['archived'] = $value;
                break;
            case 'soft-deleted':
                $value = $this->asSoftDeleted();
                if (!is_null($value)){
                    $value = JsonSerializer::serializeDateTime($value);
                }
                $result['soft-deleted'] = $value;
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
            case 'active':
                $args['value'] = null;
                break;
            case 'archived':
                if (!array_key_exists('archived', $data)){
                    throw new Exception(
                        "JSON data is missing property 'archived'",
                    );
                }
                
                $args['value'] = $data['archived'];
                break;
            case 'soft-deleted':
                if (!array_key_exists('soft-deleted', $data)){
                    throw new Exception(
                        "JSON data is missing property 'soft-deleted'",
                    );
                }
                
                $args['value'] = $data['soft-deleted'];
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
