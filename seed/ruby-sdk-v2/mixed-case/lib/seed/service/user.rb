# frozen_string_literal: true

module Seed
    module Types
        class User < Internal::Types::Model
            field :user_name, String, optional: false, nullable: false
            field :metadata_tags, Internal::Types::Array[String], optional: false, nullable: false
            field :extra_properties, Internal::Types::Hash[String, String], optional: false, nullable: false
        end
    end
end
