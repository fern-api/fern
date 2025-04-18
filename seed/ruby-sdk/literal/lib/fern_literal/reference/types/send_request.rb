# frozen_string_literal: true

require_relative "some_literal"
require_relative "container_object"
require "ostruct"
require "json"

module SeedLiteralClient
  class Reference
    class SendRequest
      # @return [String]
      attr_reader :prompt
      # @return [String]
      attr_reader :query
      # @return [Boolean]
      attr_reader :stream
      # @return [String]
      attr_reader :ending
      # @return [SeedLiteralClient::Reference::SOME_LITERAL]
      attr_reader :context
      # @return [SeedLiteralClient::Reference::SOME_LITERAL]
      attr_reader :maybe_context
      # @return [SeedLiteralClient::Reference::ContainerObject]
      attr_reader :container_object
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param prompt [String]
      # @param query [String]
      # @param stream [Boolean]
      # @param ending [String]
      # @param context [SeedLiteralClient::Reference::SOME_LITERAL]
      # @param maybe_context [SeedLiteralClient::Reference::SOME_LITERAL]
      # @param container_object [SeedLiteralClient::Reference::ContainerObject]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedLiteralClient::Reference::SendRequest]
      def initialize(prompt:, query:, stream:, ending:, context:, container_object:, maybe_context: OMIT,
                     additional_properties: nil)
        @prompt = prompt
        @query = query
        @stream = stream
        @ending = ending
        @context = context
        @maybe_context = maybe_context if maybe_context != OMIT
        @container_object = container_object
        @additional_properties = additional_properties
        @_field_set = {
          "prompt": prompt,
          "query": query,
          "stream": stream,
          "ending": ending,
          "context": context,
          "maybeContext": maybe_context,
          "containerObject": container_object
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of SendRequest
      #
      # @param json_object [String]
      # @return [SeedLiteralClient::Reference::SendRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        prompt = parsed_json["prompt"]
        query = parsed_json["query"]
        stream = parsed_json["stream"]
        ending = parsed_json["ending"]
        context = parsed_json["context"]
        maybe_context = parsed_json["maybeContext"]
        if parsed_json["containerObject"].nil?
          container_object = nil
        else
          container_object = parsed_json["containerObject"].to_json
          container_object = SeedLiteralClient::Reference::ContainerObject.from_json(json_object: container_object)
        end
        new(
          prompt: prompt,
          query: query,
          stream: stream,
          ending: ending,
          context: context,
          maybe_context: maybe_context,
          container_object: container_object,
          additional_properties: struct
        )
      end

      # Serialize an instance of SendRequest to a JSON object
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
        obj.prompt.is_a?(String) != false || raise("Passed value for field obj.prompt is not the expected type, validation failed.")
        obj.query.is_a?(String) != false || raise("Passed value for field obj.query is not the expected type, validation failed.")
        obj.stream.is_a?(Boolean) != false || raise("Passed value for field obj.stream is not the expected type, validation failed.")
        obj.ending.is_a?(String) != false || raise("Passed value for field obj.ending is not the expected type, validation failed.")
        obj.context.is_a?(String) != false || raise("Passed value for field obj.context is not the expected type, validation failed.")
        obj.maybe_context&.is_a?(String) != false || raise("Passed value for field obj.maybe_context is not the expected type, validation failed.")
        SeedLiteralClient::Reference::ContainerObject.validate_raw(obj: obj.container_object)
      end
    end
  end
end
