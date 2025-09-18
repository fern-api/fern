# frozen_string_literal: true

module Seed
  module Types
    module Types
      class BigEntity < Internal::Types::Model
        field :cast_member, -> { Seed::Types::Types::CastMember }, optional: true, nullable: false
        field :extended_movie, -> { Seed::Types::Types::ExtendedMovie }, optional: true, nullable: false
        field :entity, -> { Seed::Types::Types::Entity }, optional: true, nullable: false
        field :metadata, -> { Seed::Types::Types::Metadata }, optional: true, nullable: false
        field :common_metadata, -> { Seed::Commons::Types::Types::Metadata }, optional: true, nullable: false
        field :event_info, -> { Seed::Commons::Types::Types::EventInfo }, optional: true, nullable: false
        field :data, -> { Seed::Commons::Types::Types::Data }, optional: true, nullable: false
        field :migration, -> { Seed::Types::Types::Migration }, optional: true, nullable: false
        field :exception, -> { Seed::Types::Types::Exception }, optional: true, nullable: false
        field :test, -> { Seed::Types::Types::Test }, optional: true, nullable: false
        field :node, -> { Seed::Types::Types::Node }, optional: true, nullable: false
        field :directory, -> { Seed::Types::Types::Directory }, optional: true, nullable: false
        field :moment, -> { Seed::Types::Types::Moment }, optional: true, nullable: false
      end
    end
  end
end
