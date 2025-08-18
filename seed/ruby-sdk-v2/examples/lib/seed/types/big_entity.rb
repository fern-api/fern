# frozen_string_literal: true

module Seed
    module Types
        class BigEntity < Internal::Types::Model
            field :cast_member, Seed::Types::CastMember, optional: true, nullable: false
            field :extended_movie, Seed::Types::ExtendedMovie, optional: true, nullable: false
            field :entity, Seed::Types::Entity, optional: true, nullable: false
            field :metadata, Seed::Types::Metadata, optional: true, nullable: false
            field :common_metadata, Seed::Commons::Types::Metadata, optional: true, nullable: false
            field :event_info, Seed::Commons::Types::EventInfo, optional: true, nullable: false
            field :data, Seed::Commons::Types::Data, optional: true, nullable: false
            field :migration, Seed::Types::Migration, optional: true, nullable: false
            field :exception, Seed::Types::Exception, optional: true, nullable: false
            field :test, Seed::Types::Test, optional: true, nullable: false
            field :node, Seed::Types::Node, optional: true, nullable: false
            field :directory, Seed::Types::Directory, optional: true, nullable: false
            field :moment, Seed::Types::Moment, optional: true, nullable: false

    end
end
