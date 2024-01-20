# frozen_string_literal: true

module SeedClient
  module Foo
    class FilteredType
      attr_reader :public_property, :private_property, :additional_properties

      # @param public_property [String]
      # @param private_property [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Foo::FilteredType]
      def initialze(private_property:, public_property: nil, additional_properties: nil)
        # @type [String]
        @public_property = public_property
        # @type [Integer]
        @private_property = private_property
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of FilteredType
      #
      # @param json_object [JSON]
      # @return [Foo::FilteredType]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        public_property = struct.public_property
        private_property = struct.private_property
        new(public_property: public_property, private_property: private_property, additional_properties: struct)
      end

      # Serialize an instance of FilteredType to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          public_property: @public_property,
          private_property: @private_property
        }.to_json
      end
    end
  end
end
