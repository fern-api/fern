# frozen_string_literal: true

module FernExamples
  module Types
    module Types
      class BigEntity < Internal::Types::Model
        field :cast_member, -> { FernExamples::Types::Types::CastMember }, optional: true, nullable: false, api_name: "castMember"
        field :extended_movie, -> { FernExamples::Types::Types::ExtendedMovie }, optional: true, nullable: false, api_name: "extendedMovie"
        field :entity, -> { FernExamples::Types::Types::Entity }, optional: true, nullable: false
        field :metadata, -> { FernExamples::Types::Types::Metadata }, optional: true, nullable: false
        field :common_metadata, -> { FernExamples::Commons::Types::Types::Metadata }, optional: true, nullable: false, api_name: "commonMetadata"
        field :event_info, -> { FernExamples::Commons::Types::Types::EventInfo }, optional: true, nullable: false, api_name: "eventInfo"
        field :data, -> { FernExamples::Commons::Types::Types::Data }, optional: true, nullable: false
        field :migration, -> { FernExamples::Types::Types::Migration }, optional: true, nullable: false
        field :exception, -> { FernExamples::Types::Types::Exception }, optional: true, nullable: false
        field :test, -> { FernExamples::Types::Types::Test }, optional: true, nullable: false
        field :node, -> { FernExamples::Types::Types::Node }, optional: true, nullable: false
        field :directory, -> { FernExamples::Types::Types::Directory }, optional: true, nullable: false
        field :moment, -> { FernExamples::Types::Types::Moment }, optional: true, nullable: false
      end
    end
  end
end
