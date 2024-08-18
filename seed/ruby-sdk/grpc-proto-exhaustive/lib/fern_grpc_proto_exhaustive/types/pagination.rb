# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class Pagination
    # @return [String]
    attr_reader :next_
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param next_ [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::Pagination]
    def initialize(next_: OMIT, additional_properties: nil)
      @next_ = next_ if next_ != OMIT
      @additional_properties = additional_properties
      @_field_set = { "next": next_ }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of Pagination
    #
    # @param json_object [String]
    # @return [SeedApiClient::Pagination]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      next_ = parsed_json["next"]
      new(next_: next_, additional_properties: struct)
    end

    # Serialize an instance of Pagination to a JSON object
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
      obj.next_&.is_a?(String) != false || raise("Passed value for field obj.next_ is not the expected type, validation failed.")
    end
  end
end
