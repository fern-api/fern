# frozen_string_literal: true

module Seed
    module Types
        class ImportingA < Internal::Types::Model
            field :a, Seed::A::A, optional: true, nullable: false

    end
end
