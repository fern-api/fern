# frozen_string_literal: true

module Seed
    module Types
        class User < Internal::Types::Model
            field :name, String, optional: false, nullable: false

    end
end
