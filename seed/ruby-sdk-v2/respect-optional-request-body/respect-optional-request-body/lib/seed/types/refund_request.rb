# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class RefundRequest < Internal::Types::Model
      field :amount, -> { Float }, optional: true, nullable: false
    end
  end
end
