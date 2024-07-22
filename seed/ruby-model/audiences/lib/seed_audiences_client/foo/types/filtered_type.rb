# frozen_string_literal: true

require "ostruct"
require "json"

module SeedAudiencesClient
  class Foo
    class FilteredType
      # @return [String]
      attr_reader :public_property
      # @return [Integer]
      attr_reader :private_property
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param public_property [String]
      # @param private_property [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedAudiencesClient::Foo::FilteredType]
      def initialize(private_property:, public_property: OMIT, additional_properties: nil)
        @public_property = public_property if public_property != OMIT
        @private_property = private_property
        @additional_properties = additional_properties
        @_field_set = { "public_property": public_property, "private_property": private_property }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of FilteredType
      #
      # @param json_object [String]
      # @return [SeedAudiencesClient::Foo::FilteredType]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        public_property = parsed_json["public_property"]
        private_property = parsed_json["private_property"]
        new(
          public_property: public_property,
          private_property: private_property,
          additional_properties: struct
        )
      end

      # Serialize an instance of FilteredType to a JSON object
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
        obj.public_property&.is_a?(String) != false || raise("Passed value for field obj.public_property is not the expected type, validation failed.")
        obj.private_property.is_a?(Integer) != false || raise("Passed value for field obj.private_property is not the expected type, validation failed.")
      end
    end
  end
end
