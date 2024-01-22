# frozen_string_literal: true

require "json"

module SeedClient
  class Docs
    attr_reader :docs, :additional_properties

    # @param docs [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [Docs]
    def initialze(docs:, additional_properties: nil)
      # @type [String]
      @docs = docs
      # @type [OpenStruct]
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of Docs
    #
    # @param json_object [JSON]
    # @return [Docs]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      docs = struct.docs
      new(docs: docs, additional_properties: struct)
    end

    # Serialize an instance of Docs to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      {
        docs: @docs
      }.to_json
    end
  end
end
