# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module GeneralErrors
    module Types
      class BadObjectRequestInfo < Internal::Types::Model
        field :message, -> { String }, optional: false, nullable: false
      end
    end
  end
end
