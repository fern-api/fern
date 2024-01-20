# frozen_string_literal: true

module SeedClient
  module Package
    class Record
      attr_reader :foo, :_3_d, :additional_properties
      # @param foo [Hash{String => String}] 
      # @param _3_d [Integer] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Package::Record] 
      def initialze(foo:, _3_d:, additional_properties: nil)
        # @type [Hash{String => String}] 
        @foo = foo
        # @type [Integer] 
        @_3_d = _3_d
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of Record
      #
      # @param json_object [JSON] 
      # @return [Package::Record] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        foo = struct.foo
        _3_d = struct.3d
        new(foo: foo, _3_d: _3_d, additional_properties: struct)
      end
      # Serialize an instance of Record to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 foo: @foo,
 3d: @_3_d
}.to_json()
      end
    end
  end
end