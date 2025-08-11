# frozen_string_literal: true

module Users
    module Types
        class User < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :id, Integer, optional: true, nullable: true
        end
    end
end
