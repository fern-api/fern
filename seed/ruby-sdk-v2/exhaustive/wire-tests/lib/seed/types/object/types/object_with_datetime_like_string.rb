# frozen_string_literal: true

module Seed
  module Types
    module Object_
      module Types
        # This type tests that string fields containing datetime-like values
        # are NOT reformatted by the wire test generator. The string field
        # should preserve its exact value even if it looks like a datetime.
        class ObjectWithDatetimeLikeString < Internal::Types::Model
          field :datetime_like_string, -> { String }, optional: false, nullable: false, api_name: "datetimeLikeString"
          field :actual_datetime, -> { String }, optional: false, nullable: false, api_name: "actualDatetime"
        end
      end
    end
  end
end
