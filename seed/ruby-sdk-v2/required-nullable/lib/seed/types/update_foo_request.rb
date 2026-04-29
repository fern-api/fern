# frozen_string_literal: true

module Seed
  module Types
    class UpdateFooRequest < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :x_idempotency_key, -> { String }, optional: false, nullable: false, api_name: "X-Idempotency-Key"

      field :nullable_text, -> { String }, optional: true, nullable: false

      field :nullable_number, -> { Integer }, optional: true, nullable: false

      field :non_nullable_text, -> { String }, optional: true, nullable: false
    end
  end
end
