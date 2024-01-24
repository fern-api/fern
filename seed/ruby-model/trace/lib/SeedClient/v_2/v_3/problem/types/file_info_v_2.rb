# frozen_string_literal: true

require "json"

module SeedClient
  module V2
    module V3
      module Problem
        class FileInfoV2
          attr_reader :filename, :directory, :contents, :editable, :additional_properties

          # @param filename [String]
          # @param directory [String]
          # @param contents [String]
          # @param editable [Boolean]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::FileInfoV2]
          def initialize(filename:, directory:, contents:, editable:, additional_properties: nil)
            # @type [String]
            @filename = filename
            # @type [String]
            @directory = directory
            # @type [String]
            @contents = contents
            # @type [Boolean]
            @editable = editable
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of FileInfoV2
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::FileInfoV2]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            filename = struct.filename
            directory = struct.directory
            contents = struct.contents
            editable = struct.editable
            new(filename: filename, directory: directory, contents: contents, editable: editable,
                additional_properties: struct)
          end

          # Serialize an instance of FileInfoV2 to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            { "filename": @filename, "directory": @directory, "contents": @contents, "editable": @editable }.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
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
