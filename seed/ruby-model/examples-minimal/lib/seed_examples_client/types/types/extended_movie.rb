# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class ExtendedMovie
      # @return [Array<String>]
      attr_reader :cast
      # @return [String]
      attr_reader :foo
      # @return [Integer]
      attr_reader :bar
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param cast [Array<String>]
      # @param foo [String]
      # @param bar [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::ExtendedMovie]
      def initialize(cast:, foo:, bar:, additional_properties: nil)
        @cast = cast
        @foo = foo
        @bar = bar
        @additional_properties = additional_properties
        @_field_set = { "cast": cast, "foo": foo, "bar": bar }
      end

      # Deserialize a JSON object to an instance of ExtendedMovie
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::ExtendedMovie]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        cast = parsed_json["cast"]
        foo = parsed_json["foo"]
        bar = parsed_json["bar"]
        new(
          cast: cast,
          foo: foo,
          bar: bar,
          additional_properties: struct
        )
      end

      # Serialize an instance of ExtendedMovie to a JSON object
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
        obj.cast.is_a?(Array) != false || raise("Passed value for field obj.cast is not the expected type, validation failed.")
        obj.foo.is_a?(String) != false || raise("Passed value for field obj.foo is not the expected type, validation failed.")
        obj.bar.is_a?(Integer) != false || raise("Passed value for field obj.bar is not the expected type, validation failed.")
      end
    end
  end
end
