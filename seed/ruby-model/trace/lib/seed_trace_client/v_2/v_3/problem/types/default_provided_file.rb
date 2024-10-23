# frozen_string_literal: true

require_relative "file_info_v_2"
require_relative "../../../../commons/types/variable_type"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class DefaultProvidedFile
          # @return [SeedTraceClient::V2::V3::Problem::FileInfoV2]
          attr_reader :file
          # @return [Array<SeedTraceClient::Commons::VariableType>]
          attr_reader :related_types
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param file [SeedTraceClient::V2::V3::Problem::FileInfoV2]
          # @param related_types [Array<SeedTraceClient::Commons::VariableType>]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::DefaultProvidedFile]
          def initialize(file:, related_types:, additional_properties: nil)
            @file = file
            @related_types = related_types
            @additional_properties = additional_properties
            @_field_set = { "file": file, "relatedTypes": related_types }
          end

          # Deserialize a JSON object to an instance of DefaultProvidedFile
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::DefaultProvidedFile]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            if parsed_json["file"].nil?
              file = nil
            else
              file = parsed_json["file"].to_json
              file = SeedTraceClient::V2::V3::Problem::FileInfoV2.from_json(json_object: file)
            end
            related_types = parsed_json["relatedTypes"]&.map do |item|
              item = item.to_json
              SeedTraceClient::Commons::VariableType.from_json(json_object: item)
            end
            new(
              file: file,
              related_types: related_types,
              additional_properties: struct
            )
          end

          # Serialize an instance of DefaultProvidedFile to a JSON object
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
            SeedTraceClient::V2::V3::Problem::FileInfoV2.validate_raw(obj: obj.file)
            obj.related_types.is_a?(Array) != false || raise("Passed value for field obj.related_types is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
