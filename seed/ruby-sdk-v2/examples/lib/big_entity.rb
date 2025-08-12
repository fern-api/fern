# frozen_string_literal: true

module Types
    module Types
        class BigEntity < Internal::Types::Model
            field :cast_member, Array, optional: true, nullable: true
            field :extended_movie, Array, optional: true, nullable: true
            field :entity, Array, optional: true, nullable: true
            field :metadata, Array, optional: true, nullable: true
            field :common_metadata, Array, optional: true, nullable: true
            field :event_info, Array, optional: true, nullable: true
            field :data, Array, optional: true, nullable: true
            field :migration, Array, optional: true, nullable: true
            field :exception, Array, optional: true, nullable: true
            field :test, Array, optional: true, nullable: true
            field :node, Array, optional: true, nullable: true
            field :directory, Array, optional: true, nullable: true
            field :moment, Array, optional: true, nullable: true
        end
    end
end
