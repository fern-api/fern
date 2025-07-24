# frozen_string_literal: true

module Users
    module Types
        class NextPage < Internal::Types::Model
            field :page, Integer, optional: true, nullable: true
            field :starting_after, String, optional: true, nullable: true
        end
    end
end
