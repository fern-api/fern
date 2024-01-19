# frozen_string_literal: true
require "imdb/types/MovieId"
require "json"

module SeedClient
  module Imdb
    class Movie
      attr_reader :id, :title, :rating, :additional_properties
      # @param id [Imdb::MovieId] 
      # @param title [String] 
      # @param rating [Float] The rating scale is one to five stars
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Imdb::Movie] 
      def initialze(id:, title:, rating:, additional_properties: nil)
        # @type [Imdb::MovieId] 
        @id = id
        # @type [String] 
        @title = title
        # @type [Float] 
        @rating = rating
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of Movie
      #
      # @param json_object [JSON] 
      # @return [Imdb::Movie] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        id = Imdb::MovieId.from_json(json_object: struct.id)
        title = struct.title
        rating = struct.rating
        new(id: id, title: title, rating: rating, additional_properties: struct)
      end
      # Serialize an instance of Movie to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 id: @id,
 title: @title,
 rating: @rating
}.to_json()
      end
    end
  end
end