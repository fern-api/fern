# frozen_string_literal: true

module SeedClient
  module V2
    module Problem
      class Files
        attr_reader :files, :additional_properties
        # @param files [Array<V2::Problem::FileInfoV2>] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::Files] 
        def initialze(files:, additional_properties: nil)
          # @type [Array<V2::Problem::FileInfoV2>] 
          @files = files
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of Files
        #
        # @param json_object [JSON] 
        # @return [V2::Problem::Files] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          files = struct.files.map() do | v |
 V2::Problem::FileInfoV2.from_json(json_object: v)
end
          new(files: files, additional_properties: struct)
        end
        # Serialize an instance of Files to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 files: @files
}.to_json()
        end
      end
    end
  end
end