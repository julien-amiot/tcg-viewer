Feature: Set Selector
  As a user
  I want to switch between available card sets using the set selector dropdown
  So that I can browse cards from different sets easily

  Scenario Outline: Set selector displays available sets
    Given the card viewer is loaded
    When the page loads
    Then the set selector should be visible
    And it should display <availableSets> as options

    Examples:
      | availableSets |
      | SOS           |

  Scenario Outline: Switching to a valid set updates the view
    Given the card viewer is loaded with set "<currentSet>"
    When I select set "<newSet>" from the dropdown
    Then the filtered card count should be <filteredCount>

    Examples:
      | currentSet | newSet | filteredCount |
      | SOS        | SOS    | 10            |
