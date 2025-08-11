# frozen_string_literal: true

module Complex
    module Types
        class Conversation < Internal::Types::Model
            field :foo, String, optional: true, nullable: true
        end
    end
end
