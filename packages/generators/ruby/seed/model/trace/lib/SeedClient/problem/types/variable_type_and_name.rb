# frozen_string_literal: true

module SeedClient
  module Problem
    class VariableTypeAndName
      attr_reader :variable_type, :name, :additional_properties

      # @param variable_type [Commons::VariableType]
      # @param name [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Problem::VariableTypeAndName]
      def initialze(variable_type:, name:, additional_properties: nil)
        # @type [Commons::VariableType]
        @variable_type = variable_type
        # @type [String]
        @name = name
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of VariableTypeAndName
      #
      # @param json_object [JSON]
      # @return [Problem::VariableTypeAndName]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        variable_type = Commons::VariableType.from_json(json_object: struct.variableType)
        name = struct.name
        new(variable_type: variable_type, name: name, additional_properties: struct)
      end

      # Serialize an instance of VariableTypeAndName to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          variableType: @variable_type,
          name: @name
        }.to_json
      end
    end
  end
end
