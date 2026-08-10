# frozen_string_literal: true

module Seed
  module Types
    class RefundBody < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :body, -> { Seed::Types::RefundRequest }, optional: true, nullable: false
    end
  end
end
