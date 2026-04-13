# frozen_string_literal: true

module Seed
  module Types
    class BigUnion < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::BigUnionZero }
      member -> { Seed::Types::BigUnionOne }
      member -> { Seed::Types::BigUnionTwo }
      member -> { Seed::Types::BigUnionThree }
      member -> { Seed::Types::BigUnionFour }
      member -> { Seed::Types::BigUnionFive }
      member -> { Seed::Types::BigUnionSix }
      member -> { Seed::Types::BigUnionSeven }
      member -> { Seed::Types::BigUnionEight }
      member -> { Seed::Types::BigUnionNine }
      member -> { Seed::Types::BigUnionTen }
      member -> { Seed::Types::BigUnionEleven }
      member -> { Seed::Types::BigUnionTwelve }
      member -> { Seed::Types::BigUnionThirteen }
      member -> { Seed::Types::BigUnionFourteen }
      member -> { Seed::Types::BigUnionFifteen }
      member -> { Seed::Types::BigUnionSixteen }
      member -> { Seed::Types::BigUnionSeventeen }
      member -> { Seed::Types::BigUnionEighteen }
      member -> { Seed::Types::BigUnionNineteen }
      member -> { Seed::Types::BigUnionTwenty }
      member -> { Seed::Types::BigUnionTwentyOne }
      member -> { Seed::Types::BigUnionTwentyTwo }
      member -> { Seed::Types::BigUnionTwentyThree }
      member -> { Seed::Types::BigUnionTwentyFour }
      member -> { Seed::Types::BigUnionTwentyFive }
      member -> { Seed::Types::BigUnionTwentySix }
      member -> { Seed::Types::BigUnionTwentySeven }
      member -> { Seed::Types::BigUnionTwentyEight }
    end
  end
end
