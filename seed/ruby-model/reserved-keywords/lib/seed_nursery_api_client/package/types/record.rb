# frozen_string_literal: true

require "ostruct"
require "json"

module SeedNurseryApiClient
  class Package
    class Record
      # @return [Hash{String => String}]
      attr_reader :foo
      # @return [Integer]
      attr_reader :_3_d
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param foo [Hash{String => String}]
      # @param _3_d [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNurseryApiClient::Package::Record]
      def initialize(foo:, _3_d:, additional_properties: nil)
        @foo = foo
        @_3_d = _3_d
        @additional_properties = additional_properties
        @_field_set = { "foo": foo, "3d": _3_d }
      end

      # Deserialize a JSON object to an instance of Record
      #
      # @param json_object [String]
      # @return [SeedNurseryApiClient::Package::Record]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        foo = parsed_json["foo"]
        _3_d = parsed_json["3d"]
        new(
          foo: foo,
          _3_d: _3_d,
          additional_properties: struct
        )
      end

      # Serialize an instance of Record to a JSON object
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
        obj.foo.is_a?(Hash) != false || raise("Passed value for field obj.foo is not the expected type, validation failed.")
        obj._3_d.is_a?(Integer) != false || raise("Passed value for field obj._3_d is not the expected type, validation failed.")
      end
    end
  end
end
