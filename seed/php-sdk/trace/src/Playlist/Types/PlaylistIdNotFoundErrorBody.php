<?php

namespace Seed\Playlist\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class PlaylistIdNotFoundErrorBody extends JsonSerializableType
{
    /**
     * @var string $type
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
     *   type: string,
     *   value: (
     *    string
     *   |mixed
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @param string $playlistId
     * @return PlaylistIdNotFoundErrorBody
     */
    public static function playlistId(string $playlistId): PlaylistIdNotFoundErrorBody
    {
        return new PlaylistIdNotFoundErrorBody([
            'type' => 'playlistId',
            'value' => $playlistId,
        ]);
    }

    /**
     * @param mixed $_unknown
     * @return PlaylistIdNotFoundErrorBody
     */
    public static function _unknown(mixed $_unknown): PlaylistIdNotFoundErrorBody
    {
        return new PlaylistIdNotFoundErrorBody([
            'type' => '_unknown',
            'value' => $_unknown,
        ]);
    }

    /**
     * @return bool
     */
    public function isPlaylistId(): bool
    {
        return is_string($this->value) && $this->type === 'playlistId';
    }

    /**
     * @return string
     */
    public function asPlaylistId(): string
    {
        if (!(is_string($this->value) && $this->type === 'playlistId')) {
            throw new Exception(
                "Expected playlistId; got " . $this->type . "with value of type " . get_debug_type($this->value),
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
            case 'playlistId':
                $value = $this->value;
                $result['playlistId'] = $value;
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

        switch ($type) {
            case 'playlistId':
                $args['type'] = 'playlistId';
                if (!array_key_exists('playlistId', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'playlistId'",
                    );
                }

                $args['playlistId'] = $data['playlistId'];
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
