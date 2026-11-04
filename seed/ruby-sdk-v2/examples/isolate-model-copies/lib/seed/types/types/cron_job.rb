# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Types
    module Types
      class CronJob < Internal::Types::Model
        field :expression, -> { String }, optional: false, nullable: false
      end
    end
  end
end
