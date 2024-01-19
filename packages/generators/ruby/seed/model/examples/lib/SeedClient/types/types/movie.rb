# frozen_string_literal: true
require "types/types/MovieId"
require "commons/types/types/Tag"
require "json"

module SeedClient
  module Types
    class Movie
      attr_reader :id, :title, :from, :rating, :type, :tag, :book, :additional_properties
      # @param id [Types::MovieId] 
      # @param title [String] 
      # @param from [String] 
      # @param rating [Float] The rating scale is one to five stars
      # @param type [String] 
      # @param tag [Commons::Types::Tag] 
      # @param book [String] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::Movie] 
      def initialze(id:, title:, from:, rating:, type:, tag:, book: nil, additional_properties: nil)
        # @type [Types::MovieId] 
        @id = id
        # @type [String] 
        @title = title
        # @type [String] 
        @from = from
        # @type [Float] 
        @rating = rating
        # @type [String] 
        @type = type
        # @type [Commons::Types::Tag] 
        @tag = tag
        # @type [String] 
        @book = book
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of Movie
      #
      # @param json_object [JSON] 
      # @return [Types::Movie] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        id = Types::MovieId.from_json(json_object: struct.id)
        title = struct.title
        from = struct.from
        rating = struct.rating
        type = struct.type
        tag = Commons::Types::Tag.from_json(json_object: struct.tag)
        book = struct.book
        new(id: id, title: title, from: from, rating: rating, type: type, tag: tag, book: book, additional_properties: struct)
      end
      # Serialize an instance of Movie to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 id: @id,
 title: @title,
 from: @from,
 rating: @rating,
 type: @type,
 tag: @tag,
 book: @book
}.to_json()
      end
    end
  end
end