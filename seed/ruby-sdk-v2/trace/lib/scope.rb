# frozen_string_literal: true

module Submission
    module Types
        class Scope < Internal::Types::Model
            field :variables, Array, optional: true, nullable: true
        end
    end
end
