<?php
$years = [2012, 2007, 2002, 1997];
ini_set('auto_detect_line_endings',TRUE);
foreach ($years as $year) {
/*    $handle = fopen("./$year/STATE_Sum_All_$year.csv", 'r');
    $output = [];
    while (($data = fgetcsv($handle)) !== false) {
        if ($data[0] == 'State') {
            // header row
            continue;
        }
        $output[$data[0]] = [
            'iv' => floatval($data[1]),
            'iw' => floatval($data[2]),
            'itm' => floatval($data[3]),
            'ev' => floatval($data[4]),
            'ew' => floatval($data[5]),
            'etm' => floatval($data[6])
        ];
    }
    fclose($handle);
    file_put_contents("./$year/state_sum_all.json", json_encode($output));*/

    $output = [];
    //$handle = fopen("./$year/STATE_FoodFlow_Detail_$year.csv", 'r');
    $handle = fopen("./$year/STATE_RawData_$year.csv", 'r');
    while (($data = fgetcsv($handle)) !== false) {
        if ($data[0] == 'Source') {
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
            'tm' => floatval($data[6])
        ];
    }
    fclose($handle);
    file_put_contents("./$year/state_flow.json", json_encode($output));
}

