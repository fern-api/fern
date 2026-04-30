<?php

namespace Seed\Completions\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class StreamEventDiscriminantInData extends JsonSerializableType
{
    /**
     * @var (
     *    'group.created'
     *   |'group.deleted'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    GroupCreatedEvent
     *   |GroupDeletedEvent
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'group.created'
     *   |'group.deleted'
     *   |'_unknown'
     * ),
     *   value: (
     *    GroupCreatedEvent
     *   |GroupDeletedEvent
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @param GroupCreatedEvent $groupCreated
     * @return StreamEventDiscriminantInData
     */
    public static function groupCreated(GroupCreatedEvent $groupCreated): StreamEventDiscriminantInData
    {
        return new StreamEventDiscriminantInData([
            'type' => 'group.created',
            'value' => $groupCreated,
        ]);
    }

    /**
     * @param GroupDeletedEvent $groupDeleted
     * @return StreamEventDiscriminantInData
     */
    public static function groupDeleted(GroupDeletedEvent $groupDeleted): StreamEventDiscriminantInData
    {
        return new StreamEventDiscriminantInData([
            'type' => 'group.deleted',
            'value' => $groupDeleted,
        ]);
    }

    /**
     * @return bool
     */
    public function isGroupCreated(): bool
    {
        return $this->value instanceof GroupCreatedEvent && $this->type === 'group.created';
    }

    /**
     * @return GroupCreatedEvent
     */
    public function asGroupCreated(): GroupCreatedEvent
    {
        if (!($this->value instanceof GroupCreatedEvent && $this->type === 'group.created')) {
            throw new Exception(
                "Expected group.created; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isGroupDeleted(): bool
    {
        return $this->value instanceof GroupDeletedEvent && $this->type === 'group.deleted';
    }

    /**
     * @return GroupDeletedEvent
     */
    public function asGroupDeleted(): GroupDeletedEvent
    {
        if (!($this->value instanceof GroupDeletedEvent && $this->type === 'group.deleted')) {
            throw new Exception(
                "Expected group.deleted; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array
    {
        $result = [];
        $result['type'] = $this->type;

        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);

        switch ($this->type) {
            case 'group.created':
                $value = $this->asGroupCreated()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'group.deleted':
                $value = $this->asGroupDeleted()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)) {
                    break;
                }
                if ($this->value instanceof JsonSerializableType) {
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)) {
                    $result = array_merge($this->value, $result);
                }
        }

        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static
    {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)) {
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static
    {
        $args = [];
        if (!array_key_exists('type', $data)) {
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))) {
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }

        $args['type'] = $type;
        switch ($type) {
            case 'group.created':
                $args['value'] = GroupCreatedEvent::jsonDeserialize($data);
                break;
            case 'group.deleted':
                $args['value'] = GroupDeletedEvent::jsonDeserialize($data);
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
