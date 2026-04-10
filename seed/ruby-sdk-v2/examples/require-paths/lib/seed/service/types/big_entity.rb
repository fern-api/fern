# frozen_string_literal: true

module Seed
  module Service
    module Types
      class BigEntity < Internal::Types::Model
        field :cast_member, -> { Seed::Types::CastMember }, optional: true, nullable: false, api_name: "castMember"
        field :extended_movie, -> { Seed::Types::ExtendedMovie }, optional: true, nullable: false, api_name: "extendedMovie"
        field :entity, -> { Seed::Types::Entity }, optional: true, nullable: false
        field :metadata, -> { Seed::Types::Metadata }, optional: true, nullable: false
        field :common_metadata, -> { Seed::Types::CommonsMetadata }, optional: true, nullable: false, api_name: "commonMetadata"
        field :event_info, -> { Seed::Types::CommonsEventInfo }, optional: true, nullable: false, api_name: "eventInfo"
        field :data, -> { Seed::Types::CommonsData }, optional: true, nullable: false
        field :migration, -> { Seed::Types::Migration }, optional: true, nullable: false
        field :exception, -> { Seed::Types::Exception }, optional: true, nullable: false
        field :test, -> { Seed::Types::Test }, optional: true, nullable: false
        field :node, -> { Seed::Types::Node }, optional: true, nullable: false
        field :directory, -> { Seed::Types::Directory }, optional: true, nullable: false
        field :moment, -> { Seed::Types::Moment }, optional: true, nullable: false
      end
    end
  end
end
