# frozen_string_literal: true

module Bigunion
    module Types
        class ThankfulFactor < Internal::Types::Model
            field :value, String, optional: true, nullable: true
        end
    end
end
