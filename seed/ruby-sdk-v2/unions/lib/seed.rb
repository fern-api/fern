# frozen_string_literal: true

require "json"
require "net/http"
require "securerandom"
require "time"

require_relative "seed/internal/json/serializable"
require_relative "seed/internal/types/type"
require_relative "seed/internal/types/utils"
require_relative "seed/internal/types/union"
require_relative "seed/internal/errors/constraint_error"
require_relative "seed/internal/errors/type_error"
require_relative "seed/internal/http/base_request"
require_relative "seed/internal/json/request"
require_relative "seed/internal/http/raw_client"
require_relative "seed/internal/multipart/multipart_encoder"
require_relative "seed/internal/multipart/multipart_form_data_part"
require_relative "seed/internal/multipart/multipart_form_data"
require_relative "seed/internal/multipart/multipart_request"
require_relative "seed/internal/types/model/field"
require_relative "seed/internal/types/model"
require_relative "seed/internal/types/array"
require_relative "seed/internal/types/boolean"
require_relative "seed/internal/types/enum"
require_relative "seed/internal/types/hash"
require_relative "seed/internal/types/unknown"
require_relative "seed/errors/api_error"
require_relative "seed/errors/response_error"
require_relative "seed/errors/client_error"
require_relative "seed/errors/redirect_error"
require_relative "seed/errors/server_error"
require_relative "seed/errors/timeout_error"
require_relative "seed/internal/iterators/item_iterator"
require_relative "seed/internal/iterators/cursor_item_iterator"
require_relative "seed/internal/iterators/offset_item_iterator"
require_relative "seed/internal/iterators/cursor_page_iterator"
require_relative "seed/internal/iterators/offset_page_iterator"
require_relative "seed/errors/connection_error"
require_relative "seed/client"
require_relative "seed/bigunion/client"
require_relative "seed/union/client"

module Seed
  module Bigunion
    module Types
      autoload :NormalSweet, ::File.join(__dir__, "seed/bigunion/types/normal_sweet")
      autoload :ThankfulFactor, ::File.join(__dir__, "seed/bigunion/types/thankful_factor")
      autoload :JumboEnd, ::File.join(__dir__, "seed/bigunion/types/jumbo_end")
      autoload :HastyPain, ::File.join(__dir__, "seed/bigunion/types/hasty_pain")
      autoload :MistySnow, ::File.join(__dir__, "seed/bigunion/types/misty_snow")
      autoload :DistinctFailure, ::File.join(__dir__, "seed/bigunion/types/distinct_failure")
      autoload :PracticalPrinciple, ::File.join(__dir__, "seed/bigunion/types/practical_principle")
      autoload :LimpingStep, ::File.join(__dir__, "seed/bigunion/types/limping_step")
      autoload :VibrantExcitement, ::File.join(__dir__, "seed/bigunion/types/vibrant_excitement")
      autoload :ActiveDiamond, ::File.join(__dir__, "seed/bigunion/types/active_diamond")
      autoload :PopularLimit, ::File.join(__dir__, "seed/bigunion/types/popular_limit")
      autoload :FalseMirror, ::File.join(__dir__, "seed/bigunion/types/false_mirror")
      autoload :PrimaryBlock, ::File.join(__dir__, "seed/bigunion/types/primary_block")
      autoload :RotatingRatio, ::File.join(__dir__, "seed/bigunion/types/rotating_ratio")
      autoload :ColorfulCover, ::File.join(__dir__, "seed/bigunion/types/colorful_cover")
      autoload :DisloyalValue, ::File.join(__dir__, "seed/bigunion/types/disloyal_value")
      autoload :GruesomeCoach, ::File.join(__dir__, "seed/bigunion/types/gruesome_coach")
      autoload :TotalWork, ::File.join(__dir__, "seed/bigunion/types/total_work")
      autoload :HarmoniousPlay, ::File.join(__dir__, "seed/bigunion/types/harmonious_play")
      autoload :UniqueStress, ::File.join(__dir__, "seed/bigunion/types/unique_stress")
      autoload :UnwillingSmoke, ::File.join(__dir__, "seed/bigunion/types/unwilling_smoke")
      autoload :FrozenSleep, ::File.join(__dir__, "seed/bigunion/types/frozen_sleep")
      autoload :DiligentDeal, ::File.join(__dir__, "seed/bigunion/types/diligent_deal")
      autoload :AttractiveScript, ::File.join(__dir__, "seed/bigunion/types/attractive_script")
      autoload :HoarseMouse, ::File.join(__dir__, "seed/bigunion/types/hoarse_mouse")
      autoload :CircularCard, ::File.join(__dir__, "seed/bigunion/types/circular_card")
      autoload :PotableBad, ::File.join(__dir__, "seed/bigunion/types/potable_bad")
      autoload :TriangularRepair, ::File.join(__dir__, "seed/bigunion/types/triangular_repair")
      autoload :GaseousRoad, ::File.join(__dir__, "seed/bigunion/types/gaseous_road")
      autoload :BigUnion, ::File.join(__dir__, "seed/bigunion/types/big_union")
    end
  end

  module Types
    module Types
      autoload :Foo, ::File.join(__dir__, "seed/types/types/foo")
      autoload :Bar, ::File.join(__dir__, "seed/types/types/bar")
      autoload :Union, ::File.join(__dir__, "seed/types/types/union")
      autoload :UnionWithOptionalReference, ::File.join(__dir__, "seed/types/types/union_with_optional_reference")
      autoload :UnionWithNullableReference, ::File.join(__dir__, "seed/types/types/union_with_nullable_reference")
      autoload :UnionWithDiscriminant, ::File.join(__dir__, "seed/types/types/union_with_discriminant")
      autoload :UnionWithPrimitive, ::File.join(__dir__, "seed/types/types/union_with_primitive")
      autoload :UnionWithDuplicatePrimitive, ::File.join(__dir__, "seed/types/types/union_with_duplicate_primitive")
      autoload :UnionWithoutKey, ::File.join(__dir__, "seed/types/types/union_without_key")
      autoload :UnionWithNoProperties, ::File.join(__dir__, "seed/types/types/union_with_no_properties")
      autoload :UnionWithMultipleNoProperties, ::File.join(__dir__, "seed/types/types/union_with_multiple_no_properties")
      autoload :UnionWithLiteral, ::File.join(__dir__, "seed/types/types/union_with_literal")
      autoload :UnionWithBaseProperties, ::File.join(__dir__, "seed/types/types/union_with_base_properties")
      autoload :UnionWithTime, ::File.join(__dir__, "seed/types/types/union_with_time")
      autoload :UnionWithGlobalNameCollisions, ::File.join(__dir__, "seed/types/types/union_with_global_name_collisions")
      autoload :UnionWithOptionalTime, ::File.join(__dir__, "seed/types/types/union_with_optional_time")
      autoload :UnionWithSingleElement, ::File.join(__dir__, "seed/types/types/union_with_single_element")
      autoload :UnionWithDuplicateTypes, ::File.join(__dir__, "seed/types/types/union_with_duplicate_types")
      autoload :FooExtended, ::File.join(__dir__, "seed/types/types/foo_extended")
      autoload :UnionWithSubTypes, ::File.join(__dir__, "seed/types/types/union_with_sub_types")
      autoload :FirstItemType, ::File.join(__dir__, "seed/types/types/first_item_type")
      autoload :SecondItemType, ::File.join(__dir__, "seed/types/types/second_item_type")
      autoload :UnionWithDuplicativeDiscriminants, ::File.join(__dir__, "seed/types/types/union_with_duplicative_discriminants")
      autoload :TypeWithOptionalMap, ::File.join(__dir__, "seed/types/types/type_with_optional_map")
      autoload :TypeWithOptionalReferenceMap, ::File.join(__dir__, "seed/types/types/type_with_optional_reference_map")
      autoload :UnionWithSameStringTypes, ::File.join(__dir__, "seed/types/types/union_with_same_string_types")
      autoload :UnionWithSameNumberTypes, ::File.join(__dir__, "seed/types/types/union_with_same_number_types")
    end
  end

  module Union
    module Types
      autoload :GetShapeRequest, ::File.join(__dir__, "seed/union/types/get_shape_request")
      autoload :WithName, ::File.join(__dir__, "seed/union/types/with_name")
      autoload :Circle, ::File.join(__dir__, "seed/union/types/circle")
      autoload :Square, ::File.join(__dir__, "seed/union/types/square")
      autoload :Shape, ::File.join(__dir__, "seed/union/types/shape")
    end
  end
end
