<?php

namespace Seed\NullableOptional;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

/**
 * Undiscriminated union for testing
 */
class SearchResult extends JsonSerializableType
{
    /**
     * @var (
     *    'user'
     *   |'organization'
     *   |'document'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    UserResponse
     *   |Organization
     *   |Document
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'user'
     *   |'organization'
     *   |'document'
     *   |'_unknown'
     * ),
     *   value: (
     *    UserResponse
     *   |Organization
     *   |Document
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
     * @param UserResponse $user
     * @return SearchResult
     */
    public static function user(UserResponse $user): SearchResult {
        return new SearchResult([
            'type' => 'user',
            'value' => $user,
        ]);
    }

    /**
     * @param Organization $organization
     * @return SearchResult
     */
    public static function organization(Organization $organization): SearchResult {
        return new SearchResult([
            'type' => 'organization',
            'value' => $organization,
        ]);
    }

    /**
     * @param Document $document
     * @return SearchResult
     */
    public static function document(Document $document): SearchResult {
        return new SearchResult([
            'type' => 'document',
            'value' => $document,
        ]);
    }

    /**
     * @return bool
     */
    public function isUser(): bool {
        return $this->value instanceof UserResponse&& $this->type === 'user';
    }

    /**
     * @return UserResponse
     */
    public function asUser(): UserResponse {
        if (!($this->value instanceof UserResponse&& $this->type === 'user')){
            throw new Exception(
                "Expected user; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isOrganization(): bool {
        return $this->value instanceof Organization&& $this->type === 'organization';
    }

    /**
     * @return Organization
     */
    public function asOrganization(): Organization {
        if (!($this->value instanceof Organization&& $this->type === 'organization')){
            throw new Exception(
                "Expected organization; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isDocument(): bool {
        return $this->value instanceof Document&& $this->type === 'document';
    }

    /**
     * @return Document
     */
    public function asDocument(): Document {
        if (!($this->value instanceof Document&& $this->type === 'document')){
            throw new Exception(
                "Expected document; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'user':
                $value = $this->asUser()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'organization':
                $value = $this->asOrganization()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'document':
                $value = $this->asDocument()->jsonSerialize();
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
            case 'user':
                $args['value'] = UserResponse::jsonDeserialize($data);
                break;
            case 'organization':
                $args['value'] = Organization::jsonDeserialize($data);
                break;
            case 'document':
                $args['value'] = Document::jsonDeserialize($data);
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
