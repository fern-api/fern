# frozen_string_literal: true

module Seed
  module Types
    class NotificationMethodOne < Internal::Types::Model
      field :type, -> { Seed::Types::NotificationMethodOneType }, optional: false, nullable: false
    end
  end
end
