# frozen_string_literal: true

module User
    module Types
        class User < Internal::Types::Model
            field :name, String, optional: true, nullable: true
        end
    end
end
