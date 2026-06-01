# api-icon-rendering Specification

## Purpose

TBD - created by archiving change list-api-icons. Update Purpose after archive.

## Requirements

### Requirement: App icon renders API-provided image URL

The system SHALL render the icon URL returned by the API as an `<img>` element when the icon field is a valid HTTP/HTTPS URL. When the icon field is empty or not a valid URL, the system SHALL fall back to displaying the first character of the app name on a colored background.

#### Scenario: App has a valid icon URL from the API

- **WHEN** an app's `icon` field contains a string starting with `http://` or `https://`
- **THEN** the system renders an `<img>` element with `src` set to that URL and `alt` set to the app name

#### Scenario: App icon URL fails to load

- **WHEN** the rendered `<img>` element fires an `onError` event (e.g., broken link, network failure)
- **THEN** the system hides the broken image and displays the first character of the app name on the colored background as a fallback

#### Scenario: App icon field is empty

- **WHEN** an app's `icon` field is an empty string or falsy
- **THEN** the system shows the first character of the app name (uppercased) on the colored background

#### Scenario: App icon field contains an emoji

- **WHEN** an app's `icon` field is a non-URL string (e.g., a Unicode emoji character)
- **THEN** the system renders the emoji character as-is on the colored background

### Requirement: Shared AppIcon component

The system SHALL provide a single `AppIcon` component in `components/AppIcon/` that implements the icon rendering logic, replacing duplicate inline implementations.

#### Scenario: Replacing Home page AppIcon

- **WHEN** the Home page (`pages/Home/index.tsx`) renders an app card or featured card
- **THEN** it SHALL use the shared `AppIcon` component instead of its local definition

#### Scenario: Replacing Categories page AppIcon

- **WHEN** the Categories page (`pages/Categories/index.tsx`) renders an app card
- **THEN** it SHALL use the shared `AppIcon` component instead of its local definition
