# frozen_string_literal: true

module Service
    module Types
        class User < Internal::Types::Model
            field :user_name, String, optional: true, nullable: true
            field :metadata_tags, Array, optional: true, nullable: true
            field :extra_properties, Array, optional: true, nullable: true
        end
    end
end
