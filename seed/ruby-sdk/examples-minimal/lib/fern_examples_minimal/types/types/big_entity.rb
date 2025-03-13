# frozen_string_literal: true

require_relative "extended_movie"
require_relative "test"
require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class BigEntity
      # @return [SeedExamplesClient::Types::ExtendedMovie]
      attr_reader :extended_movie
      # @return [SeedExamplesClient::Types::Test]
      attr_reader :test
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param extended_movie [SeedExamplesClient::Types::ExtendedMovie]
      # @param test [SeedExamplesClient::Types::Test]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::BigEntity]
      def initialize(extended_movie: OMIT, test: OMIT, additional_properties: nil)
        @extended_movie = extended_movie if extended_movie != OMIT
        @test = test if test != OMIT
        @additional_properties = additional_properties
        @_field_set = { "extendedMovie": extended_movie, "test": test }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of BigEntity
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::BigEntity]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["extendedMovie"].nil?
          extended_movie = nil
        else
          extended_movie = parsed_json["extendedMovie"].to_json
          extended_movie = SeedExamplesClient::Types::ExtendedMovie.from_json(json_object: extended_movie)
        end
        if parsed_json["test"].nil?
          test = nil
        else
          test = parsed_json["test"].to_json
          test = SeedExamplesClient::Types::Test.from_json(json_object: test)
        end
        new(
          extended_movie: extended_movie,
          test: test,
          additional_properties: struct
        )
      end

      # Serialize an instance of BigEntity to a JSON object
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
        obj.extended_movie.nil? || SeedExamplesClient::Types::ExtendedMovie.validate_raw(obj: obj.extended_movie)
        obj.test.nil? || SeedExamplesClient::Types::Test.validate_raw(obj: obj.test)
      end
    end
  end
end
