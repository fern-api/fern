# frozen_string_literal: true

require_relative "cast_member"
require_relative "extended_movie"
require_relative "entity"
require_relative "metadata"
require_relative "../../commons/types/types/metadata"
require_relative "../../commons/types/types/event_info"
require_relative "../../commons/types/types/data"
require_relative "migration"
require_relative "exception"
require_relative "test"
require_relative "node"
require_relative "directory"
require_relative "moment"
require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class BigEntity
      # @return [SeedExamplesClient::Types::CastMember]
      attr_reader :cast_member
      # @return [SeedExamplesClient::Types::ExtendedMovie]
      attr_reader :extended_movie
      # @return [SeedExamplesClient::Types::Entity]
      attr_reader :entity
      # @return [SeedExamplesClient::Types::Metadata]
      attr_reader :metadata
      # @return [SeedExamplesClient::Commons::Types::Metadata]
      attr_reader :common_metadata
      # @return [SeedExamplesClient::Commons::Types::EventInfo]
      attr_reader :event_info
      # @return [SeedExamplesClient::Commons::Types::Data]
      attr_reader :data
      # @return [SeedExamplesClient::Types::Migration]
      attr_reader :migration
      # @return [SeedExamplesClient::Types::Exception]
      attr_reader :exception
      # @return [SeedExamplesClient::Types::Test]
      attr_reader :test
      # @return [SeedExamplesClient::Types::Node]
      attr_reader :node
      # @return [SeedExamplesClient::Types::Directory]
      attr_reader :directory
      # @return [SeedExamplesClient::Types::Moment]
      attr_reader :moment
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param cast_member [SeedExamplesClient::Types::CastMember]
      # @param extended_movie [SeedExamplesClient::Types::ExtendedMovie]
      # @param entity [SeedExamplesClient::Types::Entity]
      # @param metadata [SeedExamplesClient::Types::Metadata]
      # @param common_metadata [SeedExamplesClient::Commons::Types::Metadata]
      # @param event_info [SeedExamplesClient::Commons::Types::EventInfo]
      # @param data [SeedExamplesClient::Commons::Types::Data]
      # @param migration [SeedExamplesClient::Types::Migration]
      # @param exception [SeedExamplesClient::Types::Exception]
      # @param test [SeedExamplesClient::Types::Test]
      # @param node [SeedExamplesClient::Types::Node]
      # @param directory [SeedExamplesClient::Types::Directory]
      # @param moment [SeedExamplesClient::Types::Moment]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::BigEntity]
      def initialize(cast_member: OMIT, extended_movie: OMIT, entity: OMIT, metadata: OMIT, common_metadata: OMIT,
                     event_info: OMIT, data: OMIT, migration: OMIT, exception: OMIT, test: OMIT, node: OMIT, directory: OMIT, moment: OMIT, additional_properties: nil)
        @cast_member = cast_member if cast_member != OMIT
        @extended_movie = extended_movie if extended_movie != OMIT
        @entity = entity if entity != OMIT
        @metadata = metadata if metadata != OMIT
        @common_metadata = common_metadata if common_metadata != OMIT
        @event_info = event_info if event_info != OMIT
        @data = data if data != OMIT
        @migration = migration if migration != OMIT
        @exception = exception if exception != OMIT
        @test = test if test != OMIT
        @node = node if node != OMIT
        @directory = directory if directory != OMIT
        @moment = moment if moment != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "castMember": cast_member,
          "extendedMovie": extended_movie,
          "entity": entity,
          "metadata": metadata,
          "commonMetadata": common_metadata,
          "eventInfo": event_info,
          "data": data,
          "migration": migration,
          "exception": exception,
          "test": test,
          "node": node,
          "directory": directory,
          "moment": moment
        }.reject do |_k, v|
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
        if parsed_json["castMember"].nil?
          cast_member = nil
        else
          cast_member = parsed_json["castMember"].to_json
          cast_member = SeedExamplesClient::Types::CastMember.from_json(json_object: cast_member)
        end
        if parsed_json["extendedMovie"].nil?
          extended_movie = nil
        else
          extended_movie = parsed_json["extendedMovie"].to_json
          extended_movie = SeedExamplesClient::Types::ExtendedMovie.from_json(json_object: extended_movie)
        end
        if parsed_json["entity"].nil?
          entity = nil
        else
          entity = parsed_json["entity"].to_json
          entity = SeedExamplesClient::Types::Entity.from_json(json_object: entity)
        end
        if parsed_json["metadata"].nil?
          metadata = nil
        else
          metadata = parsed_json["metadata"].to_json
          metadata = SeedExamplesClient::Types::Metadata.from_json(json_object: metadata)
        end
        if parsed_json["commonMetadata"].nil?
          common_metadata = nil
        else
          common_metadata = parsed_json["commonMetadata"].to_json
          common_metadata = SeedExamplesClient::Commons::Types::Metadata.from_json(json_object: common_metadata)
        end
        if parsed_json["eventInfo"].nil?
          event_info = nil
        else
          event_info = parsed_json["eventInfo"].to_json
          event_info = SeedExamplesClient::Commons::Types::EventInfo.from_json(json_object: event_info)
        end
        if parsed_json["data"].nil?
          data = nil
        else
          data = parsed_json["data"].to_json
          data = SeedExamplesClient::Commons::Types::Data.from_json(json_object: data)
        end
        if parsed_json["migration"].nil?
          migration = nil
        else
          migration = parsed_json["migration"].to_json
          migration = SeedExamplesClient::Types::Migration.from_json(json_object: migration)
        end
        if parsed_json["exception"].nil?
          exception = nil
        else
          exception = parsed_json["exception"].to_json
          exception = SeedExamplesClient::Types::Exception.from_json(json_object: exception)
        end
        if parsed_json["test"].nil?
          test = nil
        else
          test = parsed_json["test"].to_json
          test = SeedExamplesClient::Types::Test.from_json(json_object: test)
        end
        if parsed_json["node"].nil?
          node = nil
        else
          node = parsed_json["node"].to_json
          node = SeedExamplesClient::Types::Node.from_json(json_object: node)
        end
        if parsed_json["directory"].nil?
          directory = nil
        else
          directory = parsed_json["directory"].to_json
          directory = SeedExamplesClient::Types::Directory.from_json(json_object: directory)
        end
        if parsed_json["moment"].nil?
          moment = nil
        else
          moment = parsed_json["moment"].to_json
          moment = SeedExamplesClient::Types::Moment.from_json(json_object: moment)
        end
        new(
          cast_member: cast_member,
          extended_movie: extended_movie,
          entity: entity,
          metadata: metadata,
          common_metadata: common_metadata,
          event_info: event_info,
          data: data,
          migration: migration,
          exception: exception,
          test: test,
          node: node,
          directory: directory,
          moment: moment,
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
        obj.cast_member.nil? || SeedExamplesClient::Types::CastMember.validate_raw(obj: obj.cast_member)
        obj.extended_movie.nil? || SeedExamplesClient::Types::ExtendedMovie.validate_raw(obj: obj.extended_movie)
        obj.entity.nil? || SeedExamplesClient::Types::Entity.validate_raw(obj: obj.entity)
        obj.metadata.nil? || SeedExamplesClient::Types::Metadata.validate_raw(obj: obj.metadata)
        obj.common_metadata.nil? || SeedExamplesClient::Commons::Types::Metadata.validate_raw(obj: obj.common_metadata)
        obj.event_info.nil? || SeedExamplesClient::Commons::Types::EventInfo.validate_raw(obj: obj.event_info)
        obj.data.nil? || SeedExamplesClient::Commons::Types::Data.validate_raw(obj: obj.data)
        obj.migration.nil? || SeedExamplesClient::Types::Migration.validate_raw(obj: obj.migration)
        obj.exception.nil? || SeedExamplesClient::Types::Exception.validate_raw(obj: obj.exception)
        obj.test.nil? || SeedExamplesClient::Types::Test.validate_raw(obj: obj.test)
        obj.node.nil? || SeedExamplesClient::Types::Node.validate_raw(obj: obj.node)
        obj.directory.nil? || SeedExamplesClient::Types::Directory.validate_raw(obj: obj.directory)
        obj.moment.nil? || SeedExamplesClient::Types::Moment.validate_raw(obj: obj.moment)
      end
    end
  end
end
