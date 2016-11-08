<?php
$year = 2012;
ini_set('auto_detect_line_endings',TRUE);
$handle = fopen("./$year/STATE_Sum_All_$year.csv",'r');
$output = [];
while ( ($data = fgetcsv($handle) ) !== FALSE ) {
    if ($data[0] =='State') {
        // header row
        continue;
    }
    $output[$data[0]] = [
        'iv' => floatval($data[1]),
        'iw' => floatval($data[2]),
        //'id' => floatval($data[3],
        'in' => floatval($data[4]),
        'ev' => floatval($data[8]),
        'ew' => floatval($data[9]),
        //'ed' => floatval($data[10]),
        'en' => floatval($data[11])
    ];
}
fclose($handle);
file_put_contents("./$year/state_sum_all.json", json_encode($output));

$output = [];
$handle = fopen("./$year/STATE_FoodFlow_Detail_$year.csv",'r');
while ( ($data = fgetcsv($handle) ) !== FALSE ) {
    if ($data[0] =='Source') {
        // header row
        continue;
    }
    $output[] = [
        's' => $data[0],
        't' => $data[1],
        'fo' => $data[2],
        'tr' => $data[3],
        'v' => floatval($data[4]),
        'w' => floatval($data[5]),
        'd' => floatval($data[6]),
        'n' => floatval($data[7])
    ];
}
fclose($handle);
file_put_contents("./$year/state_flow.json", json_encode($output));

