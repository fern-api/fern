
module Seed
    module Types
        class BigEntity < Internal::Types::Model
            field :cast_member, Seed::types::CastMember, optional: true, nullable: false
            field :extended_movie, Seed::types::ExtendedMovie, optional: true, nullable: false
            field :entity, Seed::types::Entity, optional: true, nullable: false
            field :metadata, Seed::types::Metadata, optional: true, nullable: false
            field :common_metadata, Seed::commons::types::Metadata, optional: true, nullable: false
            field :event_info, Seed::commons::types::EventInfo, optional: true, nullable: false
            field :data, Seed::commons::types::Data, optional: true, nullable: false
            field :migration, Seed::types::Migration, optional: true, nullable: false
            field :exception, Seed::types::Exception, optional: true, nullable: false
            field :test, Seed::types::Test, optional: true, nullable: false
            field :node, Seed::types::Node, optional: true, nullable: false
            field :directory, Seed::types::Directory, optional: true, nullable: false
            field :moment, Seed::types::Moment, optional: true, nullable: false

    end
end
