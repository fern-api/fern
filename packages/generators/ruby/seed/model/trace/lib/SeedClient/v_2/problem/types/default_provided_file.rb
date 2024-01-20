# frozen_string_literal: true

module SeedClient
  module V2
    module Problem
      class DefaultProvidedFile
        attr_reader :file, :related_types, :additional_properties

        # @param file [V2::Problem::FileInfoV2]
        # @param related_types [Array<Commons::VariableType>]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::DefaultProvidedFile]
        def initialze(file:, related_types:, additional_properties: nil)
          # @type [V2::Problem::FileInfoV2]
          @file = file
          # @type [Array<Commons::VariableType>]
          @related_types = related_types
          # @type [OpenStruct]
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of DefaultProvidedFile
        #
        # @param json_object [JSON]
        # @return [V2::Problem::DefaultProvidedFile]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          file = V2::Problem::FileInfoV2.from_json(json_object: struct.file)
          related_types = struct.relatedTypes.map do |v|
            Commons::VariableType.from_json(json_object: v)
          end
          new(file: file, related_types: related_types, additional_properties: struct)
        end

        # Serialize an instance of DefaultProvidedFile to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          {
            file: @file,
            relatedTypes: @related_types
          }.to_json
        end
      end
    end
  end
end
