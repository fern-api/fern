# frozen_string_literal: true

require_relative "address"
require "ostruct"
require "json"

module SeedEmptyClientsClient
  module Level1
    module Level2
      class Types
        class Person
          # @return [String]
          attr_reader :name
          # @return [SeedEmptyClientsClient::Level1::Level2::Types::Address]
          attr_reader :address
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param name [String]
          # @param address [SeedEmptyClientsClient::Level1::Level2::Types::Address]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedEmptyClientsClient::Level1::Level2::Types::Person]
          def initialize(name:, address:, additional_properties: nil)
            @name = name
            @address = address
            @additional_properties = additional_properties
            @_field_set = { "name": name, "address": address }
          end

          # Deserialize a JSON object to an instance of Person
          #
          # @param json_object [String]
          # @return [SeedEmptyClientsClient::Level1::Level2::Types::Person]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            name = parsed_json["name"]
            if parsed_json["address"].nil?
              address = nil
            else
              address = parsed_json["address"].to_json
              address = SeedEmptyClientsClient::Level1::Level2::Types::Address.from_json(json_object: address)
            end
            new(
              name: name,
              address: address,
              additional_properties: struct
            )
          end

          # Serialize an instance of Person to a JSON object
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
            obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
            SeedEmptyClientsClient::Level1::Level2::Types::Address.validate_raw(obj: obj.address)
          end
        end
      end
    end
  end
end
