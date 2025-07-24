# frozen_string_literal: true

module Service
    module Types
        class MyObject < Internal::Types::Model
            field :foo, String, optional: true, nullable: true
        end
    end
end
