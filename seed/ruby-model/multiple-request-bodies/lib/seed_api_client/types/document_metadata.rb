# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class DocumentMetadata
    # @return [String]
    attr_reader :author
    # @return [Integer]
    attr_reader :id
    # @return [Array<Object>]
    attr_reader :tags
    # @return [String]
    attr_reader :title
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param author [String]
    # @param id [Integer]
    # @param tags [Array<Object>]
    # @param title [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::DocumentMetadata]
    def initialize(author: OMIT, id: OMIT, tags: OMIT, title: OMIT, additional_properties: nil)
      @author = author if author != OMIT
      @id = id if id != OMIT
      @tags = tags if tags != OMIT
      @title = title if title != OMIT
      @additional_properties = additional_properties
      @_field_set = { "author": author, "id": id, "tags": tags, "title": title }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of DocumentMetadata
    #
    # @param json_object [String]
    # @return [SeedApiClient::DocumentMetadata]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      author = parsed_json["author"]
      id = parsed_json["id"]
      tags = parsed_json["tags"]
      title = parsed_json["title"]
      new(
        author: author,
        id: id,
        tags: tags,
        title: title,
        additional_properties: struct
      )
    end

    # Serialize an instance of DocumentMetadata to a JSON object
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
      obj.author&.is_a?(String) != false || raise("Passed value for field obj.author is not the expected type, validation failed.")
      obj.id&.is_a?(Integer) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
      obj.tags&.is_a?(Array) != false || raise("Passed value for field obj.tags is not the expected type, validation failed.")
      obj.title&.is_a?(String) != false || raise("Passed value for field obj.title is not the expected type, validation failed.")
    end
  end
end
