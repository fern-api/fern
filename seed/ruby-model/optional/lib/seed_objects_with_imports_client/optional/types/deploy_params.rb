# frozen_string_literal: true

require "ostruct"
require "json"

module SeedObjectsWithImportsClient
  class Optional
    class DeployParams
      # @return [Boolean]
      attr_reader :update_draft
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param update_draft [Boolean]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedObjectsWithImportsClient::Optional::DeployParams]
      def initialize(update_draft: OMIT, additional_properties: nil)
        @update_draft = update_draft if update_draft != OMIT
        @additional_properties = additional_properties
        @_field_set = { "updateDraft": update_draft }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of DeployParams
      #
      # @param json_object [String]
      # @return [SeedObjectsWithImportsClient::Optional::DeployParams]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        update_draft = parsed_json["updateDraft"]
        new(update_draft: update_draft, additional_properties: struct)
      end

      # Serialize an instance of DeployParams to a JSON object
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
        obj.update_draft&.is_a?(Boolean) != false || raise("Passed value for field obj.update_draft is not the expected type, validation failed.")
      end
    end
  end
end
