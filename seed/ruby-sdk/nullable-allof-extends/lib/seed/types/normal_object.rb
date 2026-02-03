# frozen_string_literal: true

module Seed
  module Types
    # A standard object with no nullable issues.
    class NormalObject < Internal::Types::Model
      field :normal_field, -> { String }, optional: true, nullable: false, api_name: "normalField"
    end
  end
end
