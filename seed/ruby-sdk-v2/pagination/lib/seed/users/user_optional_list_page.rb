# frozen_string_literal: true

module Seed
    module Types
        class UserOptionalListPage < Internal::Types::Model
            field :data, Seed::Users::UserOptionalListContainer, optional: false, nullable: false
            field :next_, String, optional: true, nullable: false

    end
end
