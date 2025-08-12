
module Seed
    module Types
        class BigEntity < Internal::Types::Model
            field :cast_member, , optional: true, nullable: false
            field :extended_movie, , optional: true, nullable: false
            field :entity, , optional: true, nullable: false
            field :metadata, , optional: true, nullable: false
            field :common_metadata, , optional: true, nullable: false
            field :event_info, , optional: true, nullable: false
            field :data, , optional: true, nullable: false
            field :migration, , optional: true, nullable: false
            field :exception, , optional: true, nullable: false
            field :test, , optional: true, nullable: false
            field :node, , optional: true, nullable: false
            field :directory, , optional: true, nullable: false
            field :moment, , optional: true, nullable: false
        end
    end
end
