# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class FileInfoV2
          # @return [String]
          attr_reader :filename
          # @return [String]
          attr_reader :directory
          # @return [String]
          attr_reader :contents
          # @return [Boolean]
          attr_reader :editable
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param filename [String]
          # @param directory [String]
          # @param contents [String]
          # @param editable [Boolean]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::FileInfoV2]
          def initialize(filename:, directory:, contents:, editable:, additional_properties: nil)
            @filename = filename
            @directory = directory
            @contents = contents
            @editable = editable
            @additional_properties = additional_properties
            @_field_set = { "filename": filename, "directory": directory, "contents": contents, "editable": editable }
          end

          # Deserialize a JSON object to an instance of FileInfoV2
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::FileInfoV2]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            filename = parsed_json["filename"]
            directory = parsed_json["directory"]
            contents = parsed_json["contents"]
            editable = parsed_json["editable"]
            new(
              filename: filename,
              directory: directory,
              contents: contents,
              editable: editable,
              additional_properties: struct
            )
          end

          # Serialize an instance of FileInfoV2 to a JSON object
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
            obj.filename.is_a?(String) != false || raise("Passed value for field obj.filename is not the expected type, validation failed.")
            obj.directory.is_a?(String) != false || raise("Passed value for field obj.directory is not the expected type, validation failed.")
            obj.contents.is_a?(String) != false || raise("Passed value for field obj.contents is not the expected type, validation failed.")
            obj.editable.is_a?(Boolean) != false || raise("Passed value for field obj.editable is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
