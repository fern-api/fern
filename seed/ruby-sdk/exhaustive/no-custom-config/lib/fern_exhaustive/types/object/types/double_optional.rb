# frozen_string_literal: true

require_relative "optional_alias"
require "ostruct"
require "json"

module SeedExhaustiveClient
  module Types
    class Object_
      class DoubleOptional
        # @return [SeedExhaustiveClient::Types::Object_::OPTIONAL_ALIAS]
        attr_reader :optional_alias
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param optional_alias [SeedExhaustiveClient::Types::Object_::OPTIONAL_ALIAS]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedExhaustiveClient::Types::Object_::DoubleOptional]
        def initialize(optional_alias: OMIT, additional_properties: nil)
          @optional_alias = optional_alias if optional_alias != OMIT
          @additional_properties = additional_properties
          @_field_set = { "optionalAlias": optional_alias }.reject do |_k, v|
            v == OMIT
          end
        end

        # Deserialize a JSON object to an instance of DoubleOptional
        #
        # @param json_object [String]
        # @return [SeedExhaustiveClient::Types::Object_::DoubleOptional]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          optional_alias = parsed_json["optionalAlias"]
          new(optional_alias: optional_alias, additional_properties: struct)
        end

        # Serialize an instance of DoubleOptional to a JSON object
        #
        # @return [String]
        def to_json(*_args)
          @_field_set&.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given
        #  hash and check each fields type against the current object's property
        #  definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.optional_alias&.is_a?(String) != false || raise("Passed value for field obj.optional_alias is not the expected type, validation failed.")
        end
      end
    end
  end
end
