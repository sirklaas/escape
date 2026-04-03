<?php
/**
 * Bricks Location Text Importer
 * Use this code in Bricks to dynamically load location text from escapedata.json
 */

function get_escape_location_data($location_number) {
    // Path to your JSON file
    $json_file = $_SERVER['DOCUMENT_ROOT'] . '/fun/escapedata.json';
    
    // Check if file exists
    if (!file_exists($json_file)) {
        return [
            'heading' => 'Location data not found',
            'subheading' => 'Please check JSON file path',
            'body' => 'The escapedata.json file could not be loaded.'
        ];
    }
    
    // Read and decode JSON
    $json_data = file_get_contents($json_file);
    $data = json_decode($json_data, true);
    
    // Check if data is valid
    if (!$data || !isset($data['locations'])) {
        return [
            'heading' => 'Invalid data format',
            'subheading' => 'JSON structure error',
            'body' => 'The JSON file does not contain valid location data.'
        ];
    }
    
    // Find the location by number
    foreach ($data['locations'] as $location) {
        if ($location['locationNumber'] == $location_number) {
            return [
                'heading' => $location['heading'] ?: 'No heading set',
                'subheading' => $location['subheading'] ?: 'No subheading set',
                'body' => $location['body'] ?: 'No description set',
                'name' => $location['name'] ?: 'Unknown',
                'startUrl' => $location['startUrl'] ?: '#'
            ];
        }
    }
    
    // Location not found
    return [
        'heading' => 'Location not found',
        'subheading' => 'Invalid location number',
        'body' => "Location {$location_number} does not exist in the data."
    ];
}

// Usage examples for each location:

// For Loc 01 (Blokker)
function get_loc01_data() {
    return get_escape_location_data(1);
}

// For Loc 02 (Boek)
function get_loc02_data() {
    return get_escape_location_data(2);
}

// For Loc 03 (Electro)
function get_loc03_data() {
    return get_escape_location_data(3);
}

// For Loc 04 (Lijst)
function get_loc04_data() {
    return get_escape_location_data(4);
}

// For Loc 05 (Kerk)
function get_loc05_data() {
    return get_escape_location_data(5);
}

// For Loc 06 (Brug)
function get_loc06_data() {
    return get_escape_location_data(6);
}

// For Loc 07 (Count)
function get_loc07_data() {
    return get_escape_location_data(7);
}

// For Loc 08 (Gall)
function get_loc08_data() {
    return get_escape_location_data(8);
}

// For Loc 09 (Drog)
function get_loc09_data() {
    return get_escape_location_data(9);
}

/**
 * Helper function to get specific field for a location
 * Usage: echo get_location_field(1, 'heading'); // Gets heading for Loc 01
 */
function get_location_field($location_number, $field) {
    $data = get_escape_location_data($location_number);
    return isset($data[$field]) ? $data[$field] : '';
}

/**
 * Get all locations data (useful for loops)
 */
function get_all_locations_data() {
    $json_file = $_SERVER['DOCUMENT_ROOT'] . '/fun/escapedata.json';
    
    if (!file_exists($json_file)) {
        return [];
    }
    
    $json_data = file_get_contents($json_file);
    $data = json_decode($json_data, true);
    
    return isset($data['locations']) ? $data['locations'] : [];
}

/**
 * Get the first page URL for a location's "start" button
 * This constructs the URL to page 1, 3, 5, etc. based on location
 */
function get_location_start_button_url($location_number) {
    $json_file = $_SERVER['DOCUMENT_ROOT'] . '/fun/escapedata.json';
    
    if (!file_exists($json_file)) {
        return '#';
    }
    
    $json_data = file_get_contents($json_file);
    $data = json_decode($json_data, true);
    
    if (!$data || !isset($data['locations'])) {
        return '#';
    }
    
    // Get location name
    $location_name = '';
    foreach ($data['locations'] as $location) {
        if ($location['locationNumber'] == $location_number) {
            $location_name = strtolower($location['name']);
            break;
        }
    }
    
    if (empty($location_name)) {
        return '#';
    }
    
    // Build the URL for the first page of this location
    // Pattern: https://www.pinkmilkgames.nl/{locationName}PB01/
    return "https://www.pinkmilkgames.nl/{$location_name}PB01/";
}

/**
 * Get the page number for a location's first page
 * Location 1 = Page 1, Location 2 = Page 3, Location 3 = Page 5, etc.
 */
function get_location_page_number($location_number) {
    return ($location_number * 2) - 1;
}

?>

<!-- 
USAGE IN BRICKS:

1. For a specific location heading:
<?php echo get_location_field(1, 'heading'); ?>

2. For a specific location subheading:
<?php echo get_location_field(1, 'subheading'); ?>

3. For a specific location body:
<?php echo get_location_field(1, 'body'); ?>

4. For complete location data:
<?php 
$loc01 = get_loc01_data();
echo '<h2>' . $loc01['heading'] . '</h2>';
echo '<h3>' . $loc01['subheading'] . '</h3>';
echo '<p>' . $loc01['body'] . '</p>';
?>

5. Dynamic location based on page/parameter:
<?php 
// If you have a URL parameter like ?loc=3
$location_num = isset($_GET['loc']) ? intval($_GET['loc']) : 1;
echo get_location_field($location_num, 'heading');
?>

6. Loop through all locations:
<?php 
$all_locations = get_all_locations_data();
foreach ($all_locations as $location) {
    echo '<div class="location-card">';
    echo '<h3>Loc ' . str_pad($location['locationNumber'], 2, '0', STR_PAD_LEFT) . ' / ' . $location['name'] . '</h3>';
    echo '<h4>' . $location['heading'] . '</h4>';
    echo '<p>' . $location['subheading'] . '</p>';
    echo '<div>' . $location['body'] . '</div>';
    echo '</div>';
}
?>

EXAMPLES FOR EACH LOCATION:

Loc 01: <?php echo get_location_field(1, 'heading'); ?>
Loc 02: <?php echo get_location_field(2, 'heading'); ?>
Loc 03: <?php echo get_location_field(3, 'heading'); ?>
Loc 04: <?php echo get_location_field(4, 'heading'); ?>
Loc 05: <?php echo get_location_field(5, 'heading'); ?>
Loc 06: <?php echo get_location_field(6, 'heading'); ?>
Loc 07: <?php echo get_location_field(7, 'heading'); ?>
Loc 08: <?php echo get_location_field(8, 'heading'); ?>
Loc 09: <?php echo get_location_field(9, 'heading'); ?>

7. For location "start" button with correct URL to first page:
<?php 
$location_number = 1; // Change to 2 for Boek, 3 for Electro, etc.
$button_url = get_location_start_button_url($location_number);
$page_number = get_location_page_number($location_number);
?>
<a href="<?php echo $button_url; ?>" class="page-button">
    start de tijd | pag <?php echo $page_number; ?>
</a>

This will correctly generate:
- Location 1 → https://www.pinkmilkgames.nl/blokkerPB01/ (Page 1)
- Location 2 → https://www.pinkmilkgames.nl/boekPB01/ (Page 3)
- Location 3 → https://www.pinkmilkgames.nl/electroPB01/ (Page 5)
- etc.

-->
