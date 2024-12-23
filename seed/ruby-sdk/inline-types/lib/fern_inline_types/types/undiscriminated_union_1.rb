# frozen_string_literal: true

require "json"
require_relative "undiscriminated_union_1_inline_type_1"
require_relative "undiscriminated_union_1_inline_type_2"
require_relative "undiscriminated_union_1_discriminated_union_1"
require "set"
require_relative "reference_type"

module SeedObjectClient
  # lorem ipsum
  class UndiscriminatedUnion1
    # Deserialize a JSON object to an instance of UndiscriminatedUnion1
    #
    # @param json_object [String]
    # @return [SeedObjectClient::UndiscriminatedUnion1]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      begin
        SeedObjectClient::UndiscriminatedUnion1InlineType1.validate_raw(obj: struct)
        return SeedObjectClient::UndiscriminatedUnion1InlineType1.from_json(json_object: struct) unless struct.nil?

        return nil
      rescue StandardError
        # noop
      end
      begin
        SeedObjectClient::UndiscriminatedUnion1InlineType2.validate_raw(obj: struct)
        return SeedObjectClient::UndiscriminatedUnion1InlineType2.from_json(json_object: struct) unless struct.nil?

        return nil
      rescue StandardError
        # noop
      end
      begin
        SeedObjectClient::UndiscriminatedUnion1DiscriminatedUnion1.validate_raw(obj: struct)
        unless struct.nil?
          return SeedObjectClient::UndiscriminatedUnion1DiscriminatedUnion1.from_json(json_object: struct)
        end

        return nil
      rescue StandardError
        # noop
      end
      begin
        SeedObjectClient::UndiscriminatedUnion1DiscriminatedUnion1.validate_raw(obj: struct)
        unless struct.nil?
          return SeedObjectClient::UndiscriminatedUnion1DiscriminatedUnion1.from_json(json_object: struct)
        end

        return nil
      rescue StandardError
        # noop
      end
      begin
        struct.is_a?(SeedObjectClient::UndiscriminatedUnion1InlineEnum1) != false || raise("Passed value for field struct is not the expected type, validation failed.")
        return struct unless struct.nil?

        return nil
      rescue StandardError
        # noop
      end
      begin
        struct.is_a?(String) != false || raise("Passed value for field struct is not the expected type, validation failed.")
        return struct unless struct.nil?

        return nil
      rescue StandardError
        # noop
      end
      begin
        struct.is_a?(Array) != false || raise("Passed value for field struct is not the expected type, validation failed.")
        return nil if struct.nil?

        return struct&.map do |item|
          item = item.to_json
          SeedObjectClient::UndiscriminatedUnion1InlineListItem1.from_json(json_object: item)
        end
      rescue StandardError
        # noop
      end
      begin
        struct.is_a?(Set) != false || raise("Passed value for field struct is not the expected type, validation failed.")
        return Set.new(struct) unless struct.nil?

        return nil
      rescue StandardError
        # noop
      end
      begin
        struct.is_a?(Hash) != false || raise("Passed value for field struct is not the expected type, validation failed.")
        return nil if struct.nil?

        return struct&.transform_values do |value|
          value = value.to_json
          SeedObjectClient::UndiscriminatedUnion1InlineMapItem1.from_json(json_object: value)
        end
      rescue StandardError
        # noop
      end
      begin
        SeedObjectClient::ReferenceType.validate_raw(obj: struct)
        return SeedObjectClient::ReferenceType.from_json(json_object: struct) unless struct.nil?

        return nil
      rescue StandardError
        # noop
      end
      struct
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given
    #  hash and check each fields type against the current object's property
    #  definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      begin
        return SeedObjectClient::UndiscriminatedUnion1InlineType1.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      begin
        return SeedObjectClient::UndiscriminatedUnion1InlineType2.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      begin
        return SeedObjectClient::UndiscriminatedUnion1DiscriminatedUnion1.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      begin
        return SeedObjectClient::UndiscriminatedUnion1DiscriminatedUnion1.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      begin
        return obj.is_a?(SeedObjectClient::UndiscriminatedUnion1InlineEnum1) != false || raise("Passed value for field obj is not the expected type, validation failed.")
      rescue StandardError
        # noop
      end
      begin
        return obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
      rescue StandardError
        # noop
      end
      begin
        return obj.is_a?(Array) != false || raise("Passed value for field obj is not the expected type, validation failed.")
      rescue StandardError
        # noop
      end
      begin
        return obj.is_a?(Set) != false || raise("Passed value for field obj is not the expected type, validation failed.")
      rescue StandardError
        # noop
      end
      begin
        return obj.is_a?(Hash) != false || raise("Passed value for field obj is not the expected type, validation failed.")
      rescue StandardError
        # noop
      end
      begin
        return SeedObjectClient::ReferenceType.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      raise("Passed value matched no type within the union, validation failed.")
    end
  end
end
