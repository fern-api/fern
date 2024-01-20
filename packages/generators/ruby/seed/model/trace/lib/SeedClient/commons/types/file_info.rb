# frozen_string_literal: true

module SeedClient
  module Commons
    class FileInfo
      attr_reader :filename, :contents, :additional_properties
      # @param filename [String] 
      # @param contents [String] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::FileInfo] 
      def initialze(filename:, contents:, additional_properties: nil)
        # @type [String] 
        @filename = filename
        # @type [String] 
        @contents = contents
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of FileInfo
      #
      # @param json_object [JSON] 
      # @return [Commons::FileInfo] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        filename = struct.filename
        contents = struct.contents
        new(filename: filename, contents: contents, additional_properties: struct)
      end
      # Serialize an instance of FileInfo to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 filename: @filename,
 contents: @contents
}.to_json()
      end
    end
  end
end