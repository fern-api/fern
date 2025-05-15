# frozen_string_literal: true

require_relative "animal"
require "ostruct"
require "json"

module SeedApiClient
  class Ast
    class Acai
      # @return [SeedApiClient::Ast::Animal]
      attr_reader :animal
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param animal [SeedApiClient::Ast::Animal]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedApiClient::Ast::Acai]
      def initialize(animal:, additional_properties: nil)
        @animal = animal
        @additional_properties = additional_properties
        @_field_set = { "animal": animal }
      end

      # Deserialize a JSON object to an instance of Acai
      #
      # @param json_object [String]
      # @return [SeedApiClient::Ast::Acai]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["animal"].nil?
          animal = nil
        else
          animal = parsed_json["animal"].to_json
          animal = SeedApiClient::Ast::Animal.from_json(json_object: animal)
        end
        new(animal: animal, additional_properties: struct)
      end

      # Serialize an instance of Acai to a JSON object
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
        SeedApiClient::Ast::Animal.validate_raw(obj: obj.animal)
      end
    end
  end
end
