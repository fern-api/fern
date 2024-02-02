# frozen_string_literal: true

require_relative "file_info_v_2"
require_relative "../../../commons/types/variable_type"
require "json"

module SeedTraceClient
  module V2
    module Problem
      class DefaultProvidedFile
        attr_reader :file, :related_types, :additional_properties

        # @param file [V2::Problem::FileInfoV2]
        # @param related_types [Array<Commons::VariableType>]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::DefaultProvidedFile]
        def initialize(file:, related_types:, additional_properties: nil)
          # @type [V2::Problem::FileInfoV2]
          @file = file
          # @type [Array<Commons::VariableType>]
          @related_types = related_types
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of DefaultProvidedFile
        #
        # @param json_object [JSON]
        # @return [V2::Problem::DefaultProvidedFile]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          file = struct.file
          related_types = struct.relatedTypes
          new(file: file, related_types: related_types, additional_properties: struct)
        end

        # Serialize an instance of DefaultProvidedFile to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "file": @file, "relatedTypes": @related_types }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          V2::Problem::FileInfoV2.validate_raw(obj: obj.file)
          obj.related_types.is_a?(Array) != false || raise("Passed value for field obj.related_types is not the expected type, validation failed.")
        end
      end
    end
  end
end
