# frozen_string_literal: true

module Seed
  module Types
    class PlaidError < Internal::Types::Model
      field :error_type, -> { String }, optional: false, nullable: false

      field :error_code, -> { String }, optional: false, nullable: false

      field :error_message, -> { String }, optional: false, nullable: false
    end
  end
end
