# frozen_string_literal: true

require "ostruct"
require "json"

module SeedLiteralClient
  class Reference
    class SendRequest
      attr_reader :prompt, :query, :stream, :additional_properties, :_field_set
      protected :_field_set
      OMIT = Object.new
      # @param prompt [String]
      # @param query [String]
      # @param stream [Boolean]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedLiteralClient::Reference::SendRequest]
      def initialize(prompt:, query:, stream:, additional_properties: nil)
        # @type [String]
        @prompt = prompt
        # @type [String]
        @query = query
        # @type [Boolean]
        @stream = stream
        @_field_set = { "prompt": @prompt, "query": @query, "stream": @stream }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of SendRequest
      #
      # @param json_object [String]
      # @return [SeedLiteralClient::Reference::SendRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        prompt = struct["prompt"]
        query = struct["query"]
        stream = struct["stream"]
        new(prompt: prompt, query: query, stream: stream, additional_properties: struct)
      end

      # Serialize an instance of SendRequest to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.prompt.is_a?(String) != false || raise("Passed value for field obj.prompt is not the expected type, validation failed.")
        obj.query.is_a?(String) != false || raise("Passed value for field obj.query is not the expected type, validation failed.")
        obj.stream.is_a?(Boolean) != false || raise("Passed value for field obj.stream is not the expected type, validation failed.")
      end
    end
  end
end
