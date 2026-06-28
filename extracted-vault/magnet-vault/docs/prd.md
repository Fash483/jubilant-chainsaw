# Requirements Document

## 1. Application Overview

**Application Name**: Magnet Vault

**Description**: A web-based magnet link manager that allows users to store, organize, filter, and manage magnet links using NeonDB as the backend database. The application connects directly to NeonDB from the browser without requiring a server, providing features like advanced filtering, deduplication, grouping, and browser bookmarklet integration.

## 2. Users and Usage Scenarios

**Target Users**: Users who frequently collect and manage magnet links from various sources and need an organized way to store, filter, and retrieve them.

**Core Usage Scenarios**:
- Store magnet links collected from different websites
- Filter and search through stored magnet links using various criteria
- Remove duplicate magnet links based on episode information
- Organize links into groups for batch operations
- Quickly scrape magnet links from web pages using bookmarklet

## 3. Page Structure and Functionality

```
Magnet Vault Application
├── Settings/Login Screen
└── Main Application Screen
    ├── Header Section
    ├── Add Magnet Link Section
    ├── Filter Controls Section
    ├── Priority Words Panel
    ├── Magnet Links List Section
    └── Status Bar
```

### 3.1 Settings/Login Screen

**Display Condition**: Shown when no NeonDB connection string is stored in localStorage (key: neon_connection_string), or when user clicks settings button to change connection.

**Functionality**:
- Input field for NeonDB connection string (postgresql://...)
- Save button to store connection string to localStorage
- Clear button to remove existing connection string
- Visual feedback for connection status
- After successful save, redirect to main application screen

### 3.2 Main Application Screen

#### 3.2.1 Header Section

**Functionality**:
- Display application title \"Magnet Vault\"
- Settings button to access connection string management
- Sync button to refresh data from NeonDB

#### 3.2.2 Add Magnet Link Section

**Functionality**:
- Title input field for magnet link title
- Magnet URL input field for magnet link URL
- Add button to save magnet link to NeonDB
- Auto-parse display name from magnet URL when URL is entered
- Clear input fields after successful addition

#### 3.2.3 Filter Controls Section

**Functionality**:
- Show name filter: input field to filter by show name
- All keywords filter: input field to filter by all keywords (AND logic)
- Exact keywords filter: input field to filter by exact keywords (OR logic)
- Only phrase filter: input field to show only links containing specific phrase
- Except phrase filter: input field to exclude links containing specific phrase
- Hide from top: input field to specify number of links to hide from top (un-copyable)
- Hide from bottom: input field to specify number of links to hide from bottom (un-copyable)
- Split into groups: input field to specify number of groups to split filtered links
- Sort by episode: button to sort links by episode number (S01E01 format parsing)
- Dedupe by episode: button to remove duplicate episodes based on priority words
- Exact dedupe: button to remove exact duplicate links
- Purge filtered: button to delete all filtered links from database
- Purge all: button to delete all links from database
- Copy selected: button to copy selected links to clipboard
- Copy all: button to copy all filtered links to clipboard

#### 3.2.4 Priority Words Panel

**Functionality**:
- Display list of priority words used for deduplication
- Add priority word: input field and button to add new priority word
- Remove priority word: button next to each word to remove it
- Priority words determine which duplicate to keep during dedupe by episode operation (links containing priority words are preferred)

#### 3.2.5 Magnet Links List Section

**Functionality**:
- Display all magnet links matching current filter criteria
- Each link shows: title, parsed display name, magnet URL
- Checkbox for each link to enable selection
- Links hidden by \"hide from top/bottom\" settings are displayed but marked as un-copyable
- Visual grouping when \"split into groups\" is active

#### 3.2.6 Status Bar

**Functionality**:
- Display connection status (connected/syncing/disconnected)
- Display total count of magnet links in database
- Display count of filtered/visible links

### 3.3 Bookmarklet Integration

**Functionality**:
- Provide a draggable bookmarklet link in the application
- When bookmarklet is dragged to browser bookmarks bar and clicked on any webpage, it scrapes all magnet links from that page
- Scraped links are automatically added to Magnet Vault database

## 4. Business Rules and Logic

### 4.1 NeonDB Connection Management

- Connection string is stored in localStorage with key \"neon_connection_string\"
- Application checks for connection string on startup
- If no connection string exists, show Settings/Login Screen
- Connection uses @neondatabase/serverless HTTP driver directly from browser
- No server-side component required

### 4.2 Database Table Auto-Creation

- On first successful connection, check if magnet_links table exists
- If table does not exist, automatically create it with schema:
  - id (primary key, auto-increment)
  - title (text)
  - magnet_url (text)
  - display_name (text, parsed from magnet URL)
  - created_at (timestamp)

### 4.3 Magnet Link Parsing

- When magnet URL is entered, extract display name from the magnet link
- Display name is typically found in the \"dn\" parameter of magnet URL
- Parsed display name is stored in display_name field

### 4.4 Filtering Logic

- Show name filter: matches links where title or display_name contains the specified text
- All keywords filter: matches links containing all specified keywords (space-separated, AND logic)
- Exact keywords filter: matches links containing any of the specified keywords (space-separated, OR logic)
- Only phrase filter: matches links containing the exact phrase
- Except phrase filter: excludes links containing the specified phrase
- All filters can be combined and applied simultaneously

### 4.5 Episode Sorting

- Parse episode information from display_name using pattern matching (S01E01, S1E1, etc.)
- Sort links by season number first, then episode number
- Links without episode information are placed at the end

### 4.6 Deduplication Logic

**Dedupe by Episode**:
- Group links by parsed episode number (S01E01)
- Within each episode group, check for priority words in display_name
- Keep the link that contains the most priority words
- If multiple links have same priority word count, keep the first one
- Priority words are configurable by user in Priority Words Panel

**Exact Dedupe**:
- Compare magnet_url field for exact matches
- Keep only the first occurrence of each unique magnet URL
- Remove all subsequent duplicates

### 4.7 Hide and Group Logic

- Hide from top/bottom: specified number of links are marked as un-copyable but still displayed
- Split into groups: divide filtered links into N equal groups, display with visual separation
- Hidden links are excluded from copy operations

### 4.8 Copy Operations

- Copy selected: copy magnet URLs of selected (checked) links to clipboard
- Copy all: copy magnet URLs of all filtered links (excluding hidden ones) to clipboard
- Copied format: one magnet URL per line

### 4.9 Purge Operations

- Purge filtered: delete all links matching current filter criteria from database
- Purge all: delete all links from database
- Both operations require confirmation before execution

### 4.10 Sync Operation

- Sync button refreshes data from NeonDB
- Re-fetch all magnet links from database
- Update display with latest data
- Show syncing status in status bar during operation

### 4.11 Bookmarklet Scraping

- Bookmarklet executes JavaScript on current webpage
- Searches for all anchor tags with href starting with \"magnet:\"
- Extracts magnet URLs and sends them to Magnet Vault
- Each scraped link is added to database with auto-generated title

## 5. Exceptions and Edge Cases

| Scenario | Handling |
|----------|----------|
| Invalid NeonDB connection string | Display error message, remain on Settings/Login Screen |
| NeonDB connection failure | Display error in status bar, show disconnected state |
| Empty magnet URL input | Disable Add button, show validation message |
| Duplicate magnet URL addition | Allow addition (user can dedupe later) |
| No links match filter criteria | Display \"No links found\" message |
| Purge operation with no filtered links | Show message \"No links to purge\" |
| Copy operation with no selected links | Show message \"No links selected\" |
| Bookmarklet finds no magnet links | Show notification \"No magnet links found on this page\" |
| Episode parsing fails | Treat link as having no episode information |
| Priority words list is empty during dedupe | Use first occurrence as default |
| Split into groups with value less than 1 | Ignore grouping, display all links normally |
| Hide count exceeds total link count | Hide all links |

## 6. Acceptance Criteria

1. User opens application for first time, sees Settings/Login Screen
2. User enters valid NeonDB connection string and clicks Save
3. Application connects to NeonDB, auto-creates magnet_links table if needed, and displays Main Application Screen
4. User enters title and magnet URL in Add Magnet Link Section, clicks Add button
5. Magnet link is saved to NeonDB and appears in Magnet Links List Section
6. User applies filter criteria (e.g., show name filter), and list updates to show only matching links
7. User selects links using checkboxes and clicks Copy selected button
8. Selected magnet URLs are copied to clipboard

## 7. Out of Scope for This Release

- User authentication or multi-user support
- Magnet link metadata fetching (file size, seeders, leechers)
- Torrent client integration or direct download functionality
- Cloud backup or export/import functionality
- Mobile app version
- Batch import from file
- Advanced search with regex support
- Link categorization or tagging system
- Link preview or thumbnail display
- Automatic link expiration or archiving
- Sharing links with other users
- Link statistics or analytics
- Dark/light theme toggle (only dark theme provided)
- Keyboard shortcuts
- Undo/redo functionality