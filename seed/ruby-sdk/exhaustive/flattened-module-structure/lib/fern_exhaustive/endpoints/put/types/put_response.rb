# frozen_string_literal: true

require_relative "error"
require "ostruct"
require "json"

module SeedExhaustiveClient
  module Endpoints
    module Put
      module Types
        class PutResponse
          # @return [Array<SeedExhaustiveClient::Endpoints::Put::Types::Error>]
          attr_reader :errors
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param errors [Array<SeedExhaustiveClient::Endpoints::Put::Types::Error>]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedExhaustiveClient::Endpoints::Put::Types::PutResponse]
          def initialize(errors: OMIT, additional_properties: nil)
            @errors = errors if errors != OMIT
            @additional_properties = additional_properties
            @_field_set = { "errors": errors }.reject do |_k, v|
              v == OMIT
            end
          end

          # Deserialize a JSON object to an instance of PutResponse
          #
          # @param json_object [String]
          # @return [SeedExhaustiveClient::Endpoints::Put::Types::PutResponse]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            errors = parsed_json["errors"]&.map do |item|
              item = item.to_json
              SeedExhaustiveClient::Endpoints::Put::Types::Error.from_json(json_object: item)
            end
            new(errors: errors, additional_properties: struct)
          end

          # Serialize an instance of PutResponse to a JSON object
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
            obj.errors&.is_a?(Array) != false || raise("Passed value for field obj.errors is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
