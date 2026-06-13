# SC-TCG — Card Grid Display Feature
# Jira Test Case: TCGV-1
# BDD Scenarios for card grid display with filtering

Feature: Card Grid Display
  As a user
  I want to see cards rendered in a scrollable grid with filtering options
  So that I can browse and find specific cards easily

  Scenario Outline: Cards are displayed in a grid
    Given the card viewer is loaded
    When the page loads
    Then the card grid should be visible
    And the number of cards displayed should match <expectedCount>

    Examples:
      | expectedCount |
      | 10            |

  Scenario Outline: Filter by name
    Given the card viewer is loaded
    When I filter by name "<searchTerm>"
    Then the filtered card count should be <filteredCount>

    Examples:
      | searchTerm | filteredCount |
      | "A"        | 10            |
      | "Z"        | 0             |

  Scenario Outline: Filter by color
    Given the card viewer is loaded
    When I filter by color "<color>"
    Then the filtered card count should be <filteredCount>

    Examples:
      | color | filteredCount |
      | "W"   | 10            |
      | "U"   | 10            |
      | "B"   | 10            |
      | "R"   | 10            |
      | "G"   | 10            |

  Scenario Outline: Filter by type
    Given the card viewer is loaded
    When I filter by type "<type>"
    Then the filtered card count should be <filteredCount>

    Examples:
      | type  | filteredCount |
      | "C"   | 10            |
      | "L"   | 10            |
      | "I"   | 10            |
      | "A"   | 10            |

  Scenario Outline: Filter by rarity
    Given the card viewer is loaded
    When I filter by rarity "<rarity>"
    Then the filtered card count should be <filteredCount>

    Examples:
      | rarity  | filteredCount |
      | "C"   | 10            |
      | "U"   | 10            |
      | "R"   | 10            |
      | "M"   | 10            |