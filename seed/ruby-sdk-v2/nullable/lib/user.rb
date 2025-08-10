# frozen_string_literal: true

module Nullable
    module Types
        class User < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :id, UserId, optional: true, nullable: true
            field :tags, Array, optional: true, nullable: true
            field :metadata, Array, optional: true, nullable: true
            field :email, Email, optional: true, nullable: true
            field :favorite_number, WeirdNumber, optional: true, nullable: true
            field :numbers, Array, optional: true, nullable: true
            field :strings, Array, optional: true, nullable: true
        end
    end
end
