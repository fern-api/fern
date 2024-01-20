# frozen_string_literal: true

module SeedClient
  module Package
    class Package
      attr_reader :name, :additional_properties
      # @param name [String] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Package::Package] 
      def initialze(name:, additional_properties: nil)
        # @type [String] 
        @name = name
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of Package
      #
      # @param json_object [JSON] 
      # @return [Package::Package] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        name = struct.name
        new(name: name, additional_properties: struct)
      end
      # Serialize an instance of Package to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 name: @name
}.to_json()
      end
    end
  end
end